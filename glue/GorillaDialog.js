// Toast notification function
GorillaDialog = {

  showToast: function (message, duration = 3000, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;

    // Add to document
    document.body.appendChild(toast);

    // Trigger animation (slight delay for CSS transition)
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('show');

      // Remove from DOM after fade out
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  }
}

// Usage examples:
// showToast('Message sent successfully!', 3000, 'success');
// showToast('An error occurred', 4000, 'error');
// showToast('Please wait...', 2000, 'info');

class GorillaPrompt {
  static async prompt(message, defaultValue = '') {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `
      <form method="dialog">
      <div>
        <label>${message}</label>
        </div>
        <div>
        <input type="text" size="30" value="${defaultValue}" required>
        </div>
        <div>
          <button type="submit" value="cancel">Cancel</button>
          <button type="submit" value="ok">OK</button>
        </div>
      </form>
    `;
    document.body.appendChild(dialog);
    const input = dialog.querySelector('input');

    return new Promise(resolve => {
      dialog.onclose = () => {
        resolve(dialog.returnValue === 'ok' ? input.value : null);
        dialog.remove();
      };
      dialog.showModal();
    });
  }
}

class GorillaMediaFilePrompt {
  static async prompt(message, defaultValue = '', addtoSlide = true) {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `
      <form method="dialog">
       <div>
        <label for="gorilla-recorder-media-file-name">${message}</label>
        </div>
       <div>
        <input id="gorilla-recorder-media-file-name" name="gorilla-recorder-media-file-name" type="text"  size="30" value="${defaultValue}" required>
       </div>
       <div>
        <label for="gorilla-recorder-add-to-slide">Add to current slide:</label><input  type="checkbox" id="gorilla-recorder-add-to-slide" name="gorilla-recorder-add-to-slide" ${addtoSlide ? 'checked' : ''}>
        </div>
        <div>
          <button type="submit" value="cancel">Cancel</button>
          <button type="submit" value="ok">OK</button>
        </div>
      </form>
    `;

    document.body.appendChild(dialog);

    const input = dialog.querySelector('#gorilla-recorder-media-file-name');
    const checkbox = dialog.querySelector('#gorilla-recorder-add-to-slide');

    return new Promise(resolve => {
      dialog.onclose = () => {
        resolve(dialog.returnValue === 'ok' ? { value: input.value, addtoSlide: checkbox.checked } : null);

        dialog.remove();
      };
      dialog.showModal();
    });
  }
}


class GorillaConfirm {
  static async confirm(message, defaultValue = '') {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `
      <form method="dialog">
        <div>
        <label>${message}</label>
        </div>
        <div>
          <button type="submit" value="cancel">Cancel</button>
          <button type="submit" value="ok">OK</button>
        </div>
      </form>
    `;

    document.body.appendChild(dialog);
    return new Promise(resolve => {
      dialog.onclose = () => {
        resolve(dialog.returnValue === 'ok' ? true : false);
        dialog.remove();
      };
      dialog.showModal();
    });
  }
}


class GorillaAlert {
  static async show(message) {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `
      <form method="dialog">
      <div>
        <label>${message}</label>
        </div>
        <div>
          <button type="submit" value="ok">OK</button>
        </div>
      </form>
    `;

    document.body.appendChild(dialog);

    return new Promise(resolve => {
      dialog.onclose = () => {
        resolve(true);
        dialog.remove();
      };
      dialog.showModal();
    });
  }
}
