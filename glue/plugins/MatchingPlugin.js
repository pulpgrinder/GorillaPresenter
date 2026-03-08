MatchingPlugin = {

    _dragging: false,

    renderHTML: async function (directive) {
        // Parse pairs separated by blank lines.
        // Each pair: first line = left item, second line = right item.
        const blocks = directive.split(/\n\s*\n/).filter(b => b.trim().length > 0);
        const pairs = [];

        for (const block of blocks) {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length >= 2) {
                pairs.push({ left: lines[0], right: lines[1] });
            }
        }

        if (pairs.length === 0) {
            return '<div class="error">No matching pairs found</div>';
        }

        // Left column is static (clues), right column is draggable.
        // Shuffle both independently; the user reorders the right column.
        const leftItems = pairs.map((p, i) => ({ text: p.left, id: i }));
        const rightItems = pairs.map((p, i) => ({ text: p.right, id: i }));
        MatchingPlugin.shuffle(leftItems);
        MatchingPlugin.shuffle(rightItems);

        // Unique container ID so multiple matching blocks can coexist.
        const cid = 'matching-' + Math.random().toString(36).substring(2, 11);

        let html = `<div class="gorilla-matching-container" id="${cid}">`;

        html += '<div class="gorilla-matching-left">';
        for (const item of leftItems) {
            html += `<div class="gorilla-matching-clue" data-match-id="${item.id}">${item.text}</div>`;
        }
        html += '</div>';

        html += '<div class="gorilla-matching-right">';
        for (const item of rightItems) {
            html += `<div class="gorilla-matching-item" draggable="true" data-match-id="${item.id}">${item.text}</div>`;
        }
        html += '</div>';

        html += '</div>'; // close container

        html += `<div class="gorilla-matching-button-row"><button class="gorilla-matching-check" data-container="${cid}">Check Answers</button></div>`;

        return html;
    },

    // Fisher-Yates shuffle
    shuffle: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    postprocess: function () {
        // Equalise row heights so left and right entries line up.
        document.querySelectorAll('.gorilla-matching-container').forEach(container => {
            MatchingPlugin._equalizeRowHeights(container);
        });

        // Prevent pointer events on matching containers from bubbling up
        // to the Hammer press recognizer on .gorilla-presenter-screen,
        // which would otherwise open the main menu during a long-press/drag.
        document.querySelectorAll('.gorilla-matching-container').forEach(container => {
            container.addEventListener('pointerdown', e => e.stopPropagation());
        });

        // Set up drag-and-drop on the RIGHT column (the draggable side).
        document.querySelectorAll('.gorilla-matching-right').forEach(container => {
            MatchingPlugin._setupDragDrop(container);
            MatchingPlugin._setupTouchDrag(container);
        });

        document.querySelectorAll('.gorilla-matching-check').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                const cid = btn.dataset.container;
                const container = document.getElementById(cid);
                if (!container) return;
                const leftItems = container.querySelectorAll('.gorilla-matching-clue');
                const rightItems = container.querySelectorAll('.gorilla-matching-item');

                let allCorrect = true;
                rightItems.forEach((item, i) => {
                    item.classList.remove('gorilla-matching-correct', 'gorilla-matching-incorrect');
                    if (leftItems[i] && item.dataset.matchId === leftItems[i].dataset.matchId) {
                        item.classList.add('gorilla-matching-correct');
                    } else {
                        item.classList.add('gorilla-matching-incorrect');
                        allCorrect = false;
                    }
                });

                if (allCorrect) {
                    GorillaAlert.show(GorillaSettings.settings.defaultCorrectResponse);
                } else {
                    GorillaAlert.show(GorillaSettings.settings.defaultIncorrectResponse);
                }
                return false;
            });
        });
    },

    /* ---- Equalise row heights ---- */
    _equalizeRowHeights: function (container) {
        const clues = container.querySelectorAll('.gorilla-matching-clue');
        const items = container.querySelectorAll('.gorilla-matching-item');
        const count = Math.min(clues.length, items.length);

        // Reset any previously forced heights so we can measure natural sizes.
        for (let i = 0; i < count; i++) {
            clues[i].style.height = 'auto';
            items[i].style.height = 'auto';
        }

        for (let i = 0; i < count; i++) {
            const maxH = Math.max(clues[i].offsetHeight, items[i].offsetHeight);
            clues[i].style.height = maxH + 'px';
            items[i].style.height = maxH + 'px';
        }
    },

    /* ---- HTML5 Drag & Drop (mouse / desktop) ---- */
    _setupDragDrop: function (container) {
        let draggedEl = null;

        container.addEventListener('dragstart', e => {
            if (!e.target.classList.contains('gorilla-matching-item')) return;
            draggedEl = e.target;
            MatchingPlugin._dragging = true;
            e.dataTransfer.effectAllowed = 'move';
            requestAnimationFrame(() => draggedEl.classList.add('gorilla-matching-dragging'));
        });

        container.addEventListener('dragover', e => {
            e.preventDefault();
            if (!draggedEl) return;
            const target = e.target.closest('.gorilla-matching-item');
            if (!target || target === draggedEl) return;
            const rect = target.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (e.clientY < midY) {
                container.insertBefore(draggedEl, target);
            } else {
                container.insertBefore(draggedEl, target.nextSibling);
            }
        });

        container.addEventListener('dragend', () => {
            MatchingPlugin._dragging = false;
            if (draggedEl) {
                draggedEl.classList.remove('gorilla-matching-dragging');
                draggedEl = null;
            }
            // Re-equalise heights after reorder and clear highlights.
            const outer = container.closest('.gorilla-matching-container');
            if (outer) MatchingPlugin._equalizeRowHeights(outer);
            container.querySelectorAll('.gorilla-matching-item').forEach(el => {
                el.classList.remove('gorilla-matching-correct', 'gorilla-matching-incorrect');
            });
        });
    },

    /* ---- Touch drag (mobile / tablet) ---- */
    _setupTouchDrag: function (container) {
        let touchEl = null;
        let placeholder = null;
        let offsetY = 0;

        container.addEventListener('touchstart', e => {
            const item = e.target.closest('.gorilla-matching-item');
            if (!item) return;
            MatchingPlugin._dragging = true;
            touchEl = item;
            const rect = item.getBoundingClientRect();
            offsetY = e.touches[0].clientY - rect.top;

            // Create placeholder
            placeholder = document.createElement('div');
            placeholder.className = 'gorilla-matching-placeholder';
            placeholder.style.height = rect.height + 'px';

            touchEl.classList.add('gorilla-matching-touch-dragging');
            touchEl.style.position = 'fixed';
            touchEl.style.left = rect.left + 'px';
            touchEl.style.width = rect.width + 'px';
            touchEl.style.top = (e.touches[0].clientY - offsetY) + 'px';
            touchEl.style.zIndex = '999999';

            container.insertBefore(placeholder, touchEl);
        }, { passive: true });

        container.addEventListener('touchmove', e => {
            if (!touchEl) return;
            e.preventDefault();
            const y = e.touches[0].clientY;
            touchEl.style.top = (y - offsetY) + 'px';

            // Find which sibling to insert before
            const siblings = [...container.querySelectorAll('.gorilla-matching-item:not(.gorilla-matching-touch-dragging), .gorilla-matching-placeholder')];
            for (const sib of siblings) {
                if (sib === placeholder) continue;
                const sibRect = sib.getBoundingClientRect();
                const sibMid = sibRect.top + sibRect.height / 2;
                if (y < sibMid) {
                    container.insertBefore(placeholder, sib);
                    return;
                }
            }
            container.appendChild(placeholder);
        }, { passive: false });

        container.addEventListener('touchend', () => {
            MatchingPlugin._dragging = false;
            if (!touchEl) return;
            touchEl.classList.remove('gorilla-matching-touch-dragging');
            touchEl.style.position = '';
            touchEl.style.left = '';
            touchEl.style.width = '';
            touchEl.style.top = '';
            touchEl.style.zIndex = '';

            if (placeholder && placeholder.parentNode) {
                container.insertBefore(touchEl, placeholder);
                placeholder.remove();
            }
            touchEl = null;
            placeholder = null;

            // Re-equalise and clear highlights
            const outer = container.closest('.gorilla-matching-container');
            if (outer) MatchingPlugin._equalizeRowHeights(outer);
            container.querySelectorAll('.gorilla-matching-item').forEach(el => {
                el.classList.remove('gorilla-matching-correct', 'gorilla-matching-incorrect');
            });
        });
    }
};
