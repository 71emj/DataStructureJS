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

  insertAt(index, value) {
    const template = (value, prev = null, next = null) => ({ value, prev, next });
    const target = this._find(index, 1);
    if (!target) return false;
    if (index == 0 || index == this.size - 1) {
      return index ? this.push(value) : this.unshift(value);
    }

    const prev = target.prev;
    const next = target.next;
    const cur = template(value, prev, next);
    prev.next = cur;
    next.prev = cur;
    this.size++;
    return true;
  }

  insertBefore(index, value) {
    const template = (value, prev = null, next = null) => ({ value, prev, next });
    const target = this._find(index, 1);
    if (!target) return false;
    if (index == 0 || index == this.size - 1) {
      return index ? this.push(value) : this.unshift(value);
    }
    console.log({ target, index });
    const prev = target.prev;
    const cur = template(value, prev, target);
    target.prev = cur;
    prev.next = cur;
    this.size++;
    return true;
  }

  insertAfter(index, value) {
    const template = (value, prev = null, next = null) => ({ value, prev, next });
    const target = this._find(index, 1);
    if (!target) return false;
    if (index == 0 || index == this.size - 1) {
      return index ? this.push(value) : this.unshift(value);
    }
    console.log({ target, index });
    const next = target.next;
    const cur = template(value, target, next);
    target.next = cur;
    next.prev = cur;
    this.size++;
    return true;
  }

  splice(index) {
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

  get(index) {
    return this._find(index);
  }

  _find(index, flag) {
    if (index < -1 || index > this.size - 1) {
      return undefined;
    }
    if (!index || index == this.size - 1) {
      return index ? this.tail.value : this.head.value;
    }
    // starting index 1 -->
    const fromHead = index; // 1 --> 1 > 2
    const fromTail = this.size - index - 1; // 18 --<
    let i = 0, target; //
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
    return flag ? target : target.value;
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
