export class InputManager {
  constructor() {
    this.keys = new Set();
    this.actions = {
      jumpPressed: false,
      slide: false,
      kickPressed: false,
      pausePressed: false
    };
  }

  bind() {
    window.addEventListener("keydown", (event) => {
      if (["Space", "ArrowUp", "ArrowDown"].includes(event.code)) {
        event.preventDefault();
      }
      this.keys.add(event.code);
      if (event.code === "Space" || event.code === "ArrowUp") this.actions.jumpPressed = true;
      if (event.code === "KeyK") this.actions.kickPressed = true;
      if (event.code === "KeyP" || event.code === "Escape") this.actions.pausePressed = true;
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(event.code);
      if (event.code === "ArrowDown") this.actions.slide = false;
    });
  }

  attachMobileControls(rootElement) {
    rootElement.querySelectorAll("button[data-action]").forEach((button) => {
      const action = button.dataset.action;
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        if (action === "jump") this.actions.jumpPressed = true;
        if (action === "slide") this.actions.slide = true;
        if (action === "kick") this.actions.kickPressed = true;
        if (action === "pause") this.actions.pausePressed = true;
      });
      button.addEventListener("pointerup", () => {
        if (action === "slide") this.actions.slide = false;
      });
      button.addEventListener("pointercancel", () => {
        if (action === "slide") this.actions.slide = false;
      });
    });
  }

  update() {
    this.actions.slide = this.actions.slide || this.keys.has("ArrowDown");
  }

  consumeAction(name) {
    if (!this.actions[name]) return false;
    this.actions[name] = false;
    return true;
  }
}
