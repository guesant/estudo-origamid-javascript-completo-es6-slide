import debounce from "./debounce.js";

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
    this.activeClass = "active";
  }
  transition(active) {
    this.slide.style.transition = active ? "transform .3s" : "";
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
    this.transition(false);
  }
  onMove(event) {
    const pointerPosition = getClientXFromEvent(event);
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }
  onEnd(event) {
    this.wrapper.removeEventListener(getTypeMove(event.type), this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
  }
  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
    console.log(this.dist.movement);
  }
  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }
  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }
  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { element, position };
    });
  }
  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index <= 0 ? undefined : index - 1,
      active: index,
      next: index >= last ? undefined : index + 1,
    };
  }
  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();
  }
  changeActiveClass() {
    this.slideArray.forEach(({ element }) => {
      element.classList.remove(this.activeClass);
    });
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }
  activePrevSlide() {
    if (this.index.prev !== undefined) {
      this.changeSlide(this.index.prev);
    }
  }
  activeNextSlide() {
    if (this.index.next !== undefined) {
      this.changeSlide(this.index.next);
    }
  }
  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 1000);
  }
  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }
  bindEvents() {
    this.onMove = this.onMove.bind(this);
    this.onStart = this.onStart.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
  }
  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent();
    return this;
  }
}
