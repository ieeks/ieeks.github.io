const test = require('node:test');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const source = readFileSync(join(__dirname, '..', 'script.js'), 'utf8');
const storageKey = 'toolbox:tool-clicks:v1';

function equal(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('Expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
  }
}

function setup(raw, options) {
  options = options || {};
  const memory = new Map(raw === undefined ? [] : [[storageKey, raw]]);
  const storage = {
    getItem(key) {
      if (options.blockRead) throw new Error('Storage blocked');
      return memory.get(key) || null;
    },
    setItem(key, value) {
      if (options.blockWrite) throw new Error('Storage full');
      memory.set(key, value);
    }
  };
  function card(href, category) {
    return {
      href, category, listeners: {}, style: { setProperty() {} },
      getAttribute(name) { return name === 'href' ? href : category; },
      addEventListener(name, callback) { this.listeners[name] = callback; }
    };
  }
  const original = [card('/vat/', 'tax'), card('/filament/', 'home'), card('/sublist/', 'money')];
  const grid = {
    children: original.slice(), offsetWidth: 600,
    querySelectorAll() { return this.children.slice(); },
    appendChild(item) {
      this.children.splice(this.children.indexOf(item), 1);
      this.children.push(item);
    }
  };
  const counter = {};
  const ready = [];
  const buttons = ['all', 'home', 'money'].map(filter => ({
    dataset: { filter }, attributes: {}, listeners: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { this.listeners[name] = callback; }
  }));
  const document = {
    documentElement: { getAttribute() { return 'light'; }, setAttribute() {} },
    getElementById(id) { return id === 'tools-grid' ? grid : id === 'tool-count' ? counter : null; },
    querySelector() { return null; },
    querySelectorAll(selector) {
      return selector === '.tool-card' ? grid.children.slice() :
        selector === '.tool-filters button' ? buttons : [];
    },
    addEventListener(name, callback) { if (name === 'DOMContentLoaded') ready.push(callback); }
  };
  const window = { addEventListener() {}, matchMedia() { return { matches: true }; } };
  const api = new Function('document', 'window', 'localStorage', 'setTimeout', 'requestAnimationFrame',
    source + '\nreturn { applyFilter, readToolClicks };'
  )(document, window, storage, () => 0, () => 0);
  ready.forEach(callback => callback());
  return {
    api, grid, counter, memory, original, buttons,
    order() { return grid.children.map(item => item.href); },
    click(index, type = 'click', button = 0, extra = {}) {
      const event = Object.assign({ button, defaultPrevented: false }, extra);
      original[index].listeners[type](event);
      return event;
    }
  };
}

test('first visit and ties preserve the default HTML order', () => {
  equal(setup().order(), ['/vat/', '/filament/', '/sublist/']);
  equal(setup(JSON.stringify({ '/vat/': 3, '/filament/': 3 })).order(),
    ['/vat/', '/filament/', '/sublist/']);
});

test('saved counts rank descending without losing or duplicating cards', () => {
  const env = setup(JSON.stringify({ '/filament/': 7, '/sublist/': 2, '/removed/': 100 }));
  equal(env.order(), ['/filament/', '/sublist/', '/vat/']);
  equal(env.grid.children.length, 3);
});

test('activation saves immediately, stays in place, and takes effect on reload', () => {
  const env = setup();
  env.click(1);
  equal(JSON.parse(env.memory.get(storageKey))['/filament/'], 1);
  equal(env.order(), ['/vat/', '/filament/', '/sublist/']);
  equal(setup(env.memory.get(storageKey)).order(), ['/filament/', '/vat/', '/sublist/']);
});

test('middle and modified clicks count; right and cancelled clicks do not', () => {
  const env = setup();
  const keyboardEvent = env.click(1);
  env.click(1, 'click', 0, { ctrlKey: true });
  env.click(1, 'click', 0, { metaKey: true });
  env.click(1, 'auxclick', 1);
  env.click(1, 'auxclick', 2);
  env.click(1, 'click', 0, { defaultPrevented: true });
  equal(JSON.parse(env.memory.get(storageKey))['/filament/'], 4);
  equal(keyboardEvent.defaultPrevented, false);
});

test('category buttons retain ranked DOM order and correct counts', () => {
  const env = setup(JSON.stringify({ '/sublist/': 9, '/filament/': 4 }));
  env.buttons[1].listeners.click();
  equal(env.counter.textContent, '1 Tool');
  equal(env.grid.children.filter(item => item.style.display !== 'none').map(item => item.href), ['/filament/']);
  env.buttons[0].listeners.click();
  equal(env.counter.textContent, '3 Tools');
  equal(env.order(), ['/sublist/', '/filament/', '/vat/']);
  equal(env.buttons[0].attributes['aria-pressed'], 'true');
});

test('malformed data and invalid counters safely fall back', () => {
  for (const raw of ['{bad', '[]', 'null', 'true', '42']) {
    const env = setup(raw);
    equal(env.order(), ['/vat/', '/filament/', '/sublist/']);
    env.click(1);
    equal(JSON.parse(env.memory.get(storageKey))['/filament/'], 1);
  }
  const env = setup(JSON.stringify({ '/vat/': -1, '/filament/': '9', '/sublist/': 1.5 }));
  equal(env.order(), ['/vat/', '/filament/', '/sublist/']);
  env.click(1);
  equal(JSON.parse(env.memory.get(storageKey)), { '/filament/': 1 });
});

test('blocked reads and failed writes leave links and filters functional', () => {
  for (const options of [{ blockRead: true }, { blockWrite: true }, { blockRead: true, blockWrite: true }]) {
    const env = setup(undefined, options);
    env.click(1);
    env.click(1);
    equal(env.api.readToolClicks()['/filament/'], options.blockRead ? 2 : undefined);
    env.api.applyFilter('home');
    equal(env.counter.textContent, '1 Tool');
    equal(env.order(), ['/vat/', '/filament/', '/sublist/']);
  }
});

test('writes reread other tabs and clamp counters at the safe integer limit', () => {
  const env = setup();
  env.memory.set(storageKey, JSON.stringify({ '/filament/': 12, '/sublist/': 3 }));
  env.click(1);
  equal(JSON.parse(env.memory.get(storageKey)), { '/filament/': 13, '/sublist/': 3 });
  const max = setup(JSON.stringify({ '/filament/': Number.MAX_SAFE_INTEGER }));
  max.click(1);
  equal(JSON.parse(max.memory.get(storageKey))['/filament/'], Number.MAX_SAFE_INTEGER);
});
