class LinkedList {
  constructor() {
    this.size = 0;
    this.push(...arguments);
  }
  set head(val) {
    this._head = val;
  }
  get head() {
    return this._head;
  }
  set tail(val) {
    this._tail = val;
  }
  get tail() {
    return this._tail;
  }

  _add(value, template) {
    if (!this.size) {
      this.head = template(value);
      return this.size++;
    }
    if (this.size < 2) {
      this.tail = template(value, this.head);
      this.head.next = this.tail;
      return this.size++;
    }
    const cur = template(value, this.tail);
    this.tail.next = cur;
    this.tail = cur;
    return this.size++;
  }

  push(args) {
    const template = (value, prev = null, next = null) => ({ value, prev, next });
    const it = Array.isArray(args) ? args : arguments;
    for (let i = 0, l = it.length; i < l; i++) {
      this._add(it[i], template);
    }
    return true;
  }

  pop() {
    const parent = this.tail.prev;
    parent.next = null;
    this.tail = parent;
    this.size--;
    return true;
  }

  shift() {
    const children = this.head.next;
    children.prev = null;
    this.head = children;
    this.size--;
    return true;
  }

  unshift(value) {
    const template = (value, prev = null, next = null) => ({ value, prev, next });
    const parent = template(value, null, this.head);
    this.head = parent;
    this.size++;
    return true;
  }

  get(index, flag) {
    if (index < -1 || index > this.size - 1) {
      return undefined;
    }
    const fromHead = index;
    const fromTail = this.size - index - 1;
    console.log({ index, fromHead, fromTail });
    let i = 0, target;
    if (fromHead > fromTail || ~~flag) {
      target = this.tail;
      while (i++ < fromTail) {
        target = target.prev;
      }
    } else {
      target = this.head;
      while (i++ < index) {
        target = target.next;
      }
    }
    return target.value;
  }

  toArray() {
    const array = new Array(this.size);
    let head = this.head;
    let tail = this.tail;
    const len = this.size % 2 ? (this.size + 1) / 2 : this.size / 2;
    for (let i = 0; i < len; i++) {
      array[i] = head.value;
      array[this.size - (i + 1)] = tail.value;
      head = head.next;
      tail = tail.prev;
    }
    return array;
  }
}

function benchmark(method) {
  return collection => {
    return value => {
      const start = Date.now();
      if (Array.isArray(collection) && method === "push") {
        return pushToArray(collection, value) && Date.now() - start;
      }
      return collection[method](value) && Date.now() - start;
    }
  }
}

function pushToArray(array, args) {
  for (let i = 0, l = args.length; i < l; i++) {
    array.push(args[i]);
  }
  return true;
}

function benchmarkRead(index) {
  return collection => {
    const start = Date.now();
    if (collection instanceof LinkedList) {
      return collection.get(index) && Date.now() - start;
    }
    return collection[index] && Date.now() - start;
  }
}

const array = [];
const linkedList = new LinkedList();

let benchRead = benchmarkRead(0);
const arbitrary = length => {
  const data = [];
  for (let i = 0; i < length; i++) {
    data[i] = i;
  }
  return data;
}

const benchPush = benchmark("push");
const benchPop = benchmark("pop");
const benchUnshift = benchmark("unshift");
const benchShift = benchmark("shift");
const benchTransform = benchmark("toArray");

const pushArray = benchPush(array);
const pushList = benchPush(linkedList);

const popArray = benchPop(array);
const popList = benchPop(linkedList);

const unshiftArray = benchUnshift(array);
const unshiftList = benchUnshift(linkedList);

const shiftArray = benchShift(array);
const shiftList = benchShift(linkedList);

const toArray = benchTransform(linkedList);
