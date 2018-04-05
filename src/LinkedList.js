class Node {
  constructor(value, prev = null, next = null) {
    this.value = value;
    this.prev = prev;
    this.next = next;
  }
  valueOf() {
    return this.value;
  }
}

class LinkedList {
  /*
   * TODO consider different approach to encapsulate data
  */
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

  /*
   * TODO need refactoring,
   * it seems like a little too specific for similar action
  */
  pop() {
    return this._cull("tail", "prev", "next");
  }

  shift() {
    return this._cull("head", "next", "prev");
  }
  _cull(node, dir, opposite) {
    try {
      const tar = this[node][dir];
      tar[opposite] = null;
      this[node] = tar;
    } catch (err) {
      if (!this.size) return false;
      this.head = null;
      this.tail = null;
    } finally {
      this.size--;
    }
    return true;
  }
  remove(index) {
    const target = this._find(index, 1);
    if (!target) return false;
    if (index == 0 || index == this.size - 1) {
      return index ? this.pop() : this.shift();
    }
    const prev = target.prev;
    const next = target.next;
    next.prev = prev;
    prev.next = next;
    this.size--;
    return true;
  }

  /*
   * TODO possible to combine it as one method, default to add to queue
  */
  push(args) {
    const it = Array.isArray(args) ? args : arguments;
    for (let i = 0, l = it.length; i < l; i++) {
      this._add(it[i]);
    }
    return true;
  }
  unshift(value) {
    const parent = new Node(value, null, this.head);
    this.head = parent;
    this.size++;
    return true;
  }

  /*
   * TODO need refactoring, too WET and hard to read
  */
  _add(value) {
    if (!this.size) {
      this.head = new Node(value);
      return this.size++;
    }
    if (this.size < 2) {
      this.tail = new Node(value, this.head);
      this.head.next = this.tail;
      return this.size++;
    }
    const cur = new Node(value, this.tail);
    this.tail.next = cur;
    this.tail = cur;
    return this.size++;
  }

  /*
   * TODO need refactoring
   * add more semantic meaning to variable names, hard to read
  */
  insertAt(index, value) {
    const target = this._find(index);
    let prev, next, cur;
    if (index == 0 || index == this.size - 1) {
      if (index) {
        prev = this.tail.prev;
        cur = new Node(value, prev, next);
        this.tail = cur;
      } else {
        next = this.head.next;
        cur = new Node(value, prev, next);
        this.head = cur;
      }
      return true;
    }
    if (!target) return false;
    prev = target.prev;
    next = target.next;
    cur = new Node(value, prev, next);
    prev.next = cur;
    next.prev = cur;
    return true;
  }

  /*
   * TODO the two methods could be combined as one
  */
  insertBefore(index, value) {
    if (!index) {
      return this.unshift(value);
    }
    return this._insert(index, value, "prev", "next");
  }
  insertAfter(index, value) {
    if (index == this.size - 1) {
      return this.push(value);
    }
    return this._insert(index, value, "next", "prev");
  }
  /*
   * TODO need to add more semantic meaning, atm its' hard to read
  */
  _insert(index, value, dir, opposite) {
    const target = this._find(index);
    if (!target) {
      return false;
    }
    const adjacent = target[dir];
    const node = new Node(value);
    node[ opposite ] = target;
    node[ dir ] = adjacent;
    target[ dir ] = node;
    adjacent[ opposite ] = node;
    this.size++;
    return true;
  }

  get(index) {
    const target = this._find(index);
    return target ? target.value : target;
  }
  /*
   * TODO need refactoring
  */
  _find(index) {
    if (index < -1 || index > this.size - 1) {
      return undefined;
    }
    const fromHead = index;
    const fromTail = this.size - index - 1;
    let i = 0, target;
    if (fromHead > fromTail) {
      target = this.tail;
      while (i++ < fromTail) {
        target = target.prev;
      }
    } else {
      target = this.head; // 0
      while (i++ < index) {
        target = target.next;
      }
    }
    return target;
  }

  /*
   * TODO need to experiment with implementing pre stored data -->
   * compare pros and cons (prestore introduce overhead)
  */
  toString() {
    const len = this.size;
    let string = "";
    let target = this.head;
    for (let i = 0; i < len; i++) {
      string += ", " + target.value;
      target = target.next;
    }
    return string.substring(2);
  }

  /*
  * TODO implement iterable interface, instead of custom method
  * need to look into implementation of iterator
  */
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
      const args = arguments.length > 1 ? arguments : [ value ];
      return collection[method](...args) && Date.now() - start;
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
      return collection._find(index) && Date.now() - start;
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
const benchSplice = benchmark("splice");
const benchTransform = benchmark("toArray");

const pushArray = benchPush(array);
const pushList = benchPush(linkedList);

const popArray = benchPop(array);
const popList = benchPop(linkedList);

const unshiftArray = benchUnshift(array);
const unshiftList = benchUnshift(linkedList);

const shiftArray = benchShift(array);
const shiftList = benchShift(linkedList);

const spliceArray = benchSplice(array);
const spliceList = benchSplice(linkedList);

const toArray = benchTransform(linkedList);
