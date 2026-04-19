(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  class InputManager {
    constructor() {
      this.keys = new Set();
      this.actions = { jumpPressed: false, slide: false, pausePressed: false };
    }

    bind() {
      window.addEventListener("keydown", (event) => {
        if (["Space", "ArrowUp", "ArrowDown"].includes(event.code)) event.preventDefault();
        this.keys.add(event.code);
        if (event.code === "Space" || event.code === "ArrowUp") this.actions.jumpPressed = true;
        if (event.code === "KeyP" || event.code === "Escape") this.actions.pausePressed = true;
      });

      window.addEventListener("keyup", (event) => {
        this.keys.delete(event.code);
        if (event.code === "ArrowDown") this.actions.slide = false;
      });
    }

    attachMobileControls(rootElement) {
      if (!rootElement) return;
      rootElement.querySelectorAll("button[data-action]").forEach((button) => {
        const action = button.dataset.action;
        const releaseAction = () => {
          if (action === "slide") this.actions.slide = false;
        };

        button.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          if (typeof button.setPointerCapture === "function" && event.pointerId != null) {
            try {
              button.setPointerCapture(event.pointerId);
            } catch (_err) {
              // Ignore browsers that reject capture on synthetic interactions.
            }
          }
          if (action === "jump") this.actions.jumpPressed = true;
          if (action === "slide") this.actions.slide = true;
          if (action === "pause") this.actions.pausePressed = true;
        });
        ["pointerup", "pointercancel", "pointerleave", "lostpointercapture"].forEach((eventName) => {
          button.addEventListener(eventName, releaseAction);
        });
        button.addEventListener("contextmenu", (event) => event.preventDefault());
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

  FamilyDash.InputManager = InputManager;
})();
