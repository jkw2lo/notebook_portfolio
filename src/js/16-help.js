/* ════ HELP ═════════════════════════════════════════════════ */
$("#b-help").onclick = e => {
  popup(e.currentTarget, `<div class="gl">On the page</div>
    <button><span class="gicon">✎</span>Double-click empty space to write<span class="k">dbl</span></button>
    <button><span class="gicon">▣</span>Drop or paste photos anywhere<span class="k">⌘V</span></button>
    <button><span class="gicon">✏</span>Pen / marker<span class="k">P</span></button>
    <button><span class="gicon">↖</span>Back to selecting<span class="k">V</span></button>
    <button><span class="gicon">✥</span>Hold space to pan<span class="k">Space</span></button>
    <button><span class="gicon">⌕</span>Zoom<span class="k">⌘scroll</span></button>
    <button><span class="gicon">▭</span>Drag empty space to marquee<span class="k">drag</span></button>
    <button><span class="gicon">⇧</span>Add to the selection<span class="k">⇧click</span></button>
    <hr><div class="gl">Keys</div>
    <button><span class="gicon">T</span>Text<span class="k">T</span></button>
    <button><span class="gicon">N</span>Sticky note<span class="k">N</span></button>
    <button><span class="gicon">⧉</span>Duplicate<span class="k">⌘D</span></button>
    <button><span class="gicon">↶</span>Undo / redo<span class="k">⌘Z</span></button>
    <button><span class="gicon">▲</span>Nudge 1 px, 10 with Shift<span class="k">↑↓←→</span></button>
    <button><span class="gicon">⌫</span>Delete<span class="k">⌫</span></button>
    <button><span class="gicon">🔒</span>Lock / unlock the selection<span class="k">⌘L</span></button>
    <button><span class="gicon">▦</span>Show / hide the stencil<span class="k">G</span></button>
    <button><span class="gicon">⊢</span>Rulers down the edges<span class="k">R</span></button>
    <hr><div class="gl">Getting things in and out lives under Export in the top bar.</div>`,
    ev => {
      if (ev.target.closest('[data-x="export"]')){ closePop(); exportJSON(); }
      if (ev.target.closest('[data-x="import"]')){ closePop(); importJSON(); }
      if (ev.target.closest('[data-x="pdf"]')){ closePop(); doPrint(); }
      if (ev.target.closest('[data-x="stand"]')){ closePop(); exportStandalone(); }
    });
};

