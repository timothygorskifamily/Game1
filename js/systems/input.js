(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  class InputManager {
    constructor() {
      this.keys = new Set();
      this.actions = {
        jumpPressed: false,
        slide: false,
        pauseTogglePressed: false,
        pauseMenuPressed: false
      };
    }

    pressAction(action) {
      if (action === "jump") this.actions.jumpPressed = true;
      if (action === "slide") this.actions.slide = true;
      if (action === "pauseToggle") this.actions.pauseTogglePressed = true;
      if (action === "menu") this.actions.pauseMenuPressed = true;
    }

    bind() {
      window.addEventListener("keydown", (event) => {
        const target = event.target;
        const isEditableTarget = target && (
          target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
        );
        if (isEditableTarget) return;
        if (["Space", "ArrowUp", "ArrowDown"].includes(event.code)) event.preventDefault();
        this.keys.add(event.code);
        if (event.code === "Space" || event.code === "ArrowUp") this.pressAction("jump");
        if (!event.repeat && event.code === "KeyP") this.pressAction("pauseToggle");
        if (!event.repeat && (event.code === "KeyM" || event.code === "Escape")) this.pressAction("menu");
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
          this.pressAction(action);
        });
        ["pointerup", "pointercancel", "pointerleave", "lostpointercapture"].forEach((eventName) => {
          button.addEventListener(eventName, releaseAction);
        });
        button.addEventListener("contextmenu", (event) => event.preventDefault());
      });
    }

    attachGameplayTap(rootElement, shouldHandleTap) {
      if (!rootElement) return;
      const isEnabled = typeof shouldHandleTap === "function" ? shouldHandleTap : () => true;

      rootElement.addEventListener("pointerdown", (event) => {
        if (!isEnabled()) return;
        if (event.pointerType === "mouse") return;
        if (event.isPrimary === false) return;
        event.preventDefault();
        this.pressAction("jump");
      });

      rootElement.addEventListener("contextmenu", (event) => event.preventDefault());
    }

    update() {
      this.actions.slide = this.actions.slide || this.keys.has("ArrowDown");
    }

    consumeAction(name) {
      if (!this.actions[name]) return false;
      this.actions[name] = false;
      return true;
    }

    clearPauseActions() {
      this.actions.pauseTogglePressed = false;
      this.actions.pauseMenuPressed = false;
    }
  }

  FamilyDash.InputManager = InputManager;
})();
