const getTypeMove = (type) =>
  ({
    mousedown: "mousemove",
    touchstart: "touchmove",
    mouseup: "mousemove",
    touchend: "touchmove",
  }[type]);

const getClientXFromEvent = (event) =>
  ["mousemove", "mousedown"].includes(event.type)
    ? event.clientX
    : event.changedTouches[0].clientX;

export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.dist = { movePosition: 0, movement: 0, startX: 0, finalPosition: 0 };
  }
  moveSlide(distX) {
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }
  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }
  onStart(event) {
    if (event.type === "mousedown") {
      event.preventDefault();
    }
    this.dist.startX = getClientXFromEvent(event);
    this.wrapper.addEventListener(getTypeMove(event.type), this.onMove);
  }
  onMove(event) {
    const pointerPosition = getClientXFromEvent(event);
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }
  onEnd(event) {
    this.wrapper.removeEventListener(getTypeMove(event.type), this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
  }
  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }
  bindEvents() {
    this.onMove = this.onMove.bind(this);
    this.onStart = this.onStart.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }
  init() {
    this.bindEvents();
    this.addSlideEvents();
    return this;
  }
}
