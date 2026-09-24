import {GAME_MENU_UI as MENU,HUD_TEXT,START_UI,COMPANION_TEXT,MOUNT_UI,WINDOW_UI} from './content/index.js';
import {xpToNext} from './progression.js';
import {deNum} from './number-format.js';
import {keysOf,liveKeymap} from './keymap.js';
import {bindingLabel} from './bar-keys.js';
const paths={menu:'M4 6h16M4 12h16M4 18h16',book:'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3Zm9 2v16',bag:'M5 8h14l2 13H3Zm3 0V5a4 4 0 0 1 8 0v3',person:'M8 6a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 22v-4c0-7 16-7 16 0v4',quest:'M5 2h14v20H5ZM8 7h8M8 12h8M8 17h5',map:'m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3Zm7-3v17m6-14v17'};
export const menuIcon=id=>`<canvas width="48" height="48" data-ui-icon="${id}" aria-hidden="true"></canvas>`;
export function mountShell(api){const root=document.querySelector('#gameShell');
 const brand=document.createElement('button');brand.id='gameMenuButton';brand.className='world-menu-brand';brand.innerHTML='<b>PTC</b><span>Mertloch</span>'+menuIcon('menu');brand.setAttribute('aria-label',MENU.open);/* Symbolknopf mit Tooltip statt Textpille (Runde 2b) */brand.dataset.tooltipLabel=MENU.open+' [Esc]';brand.dataset.tooltipNote='';root.append(brand);brand.onclick=()=>api.menu();
 const rail=document.createElement('nav');rail.className='game-menu-rail';rail.setAttribute('aria-label',WINDOW_UI.rail);rail.innerHTML=WINDOW_UI.windows.map(w=>{const [id,name,icon,key]=w;return `<button data-panel="${id}" data-tooltip-label="${WINDOW_UI.railLabel(w)}" data-tooltip-note="${WINDOW_UI.notes[id]}" aria-label="${WINDOW_UI.open(name)}">${menuIcon(icon)}<span>${name}</span><kbd>${key}</kbd></button>`;}).join('');root.append(rail);rail.onclick=e=>{const b=e.target.closest('[data-panel]');if(b)api.panel(b.dataset.panel);};
 const xp=document.querySelector('.xp-track');xp.classList.add('rpg-xp');xp.insertAdjacentHTML('beforeend','<span id="xpCaption"></span>');
 return{update(game){const p=game.player;document.querySelector('#xpCaption').textContent=`Stufe ${p.level} · ${deNum(Math.floor(p.xp))} / ${deNum(xpToNext(p.level))} EP`;}};
}
/** Touch: die Einzelfenster als Symbolraster oben im Spielmenü (ohne Tastatur ihr einziger Weg). */
export const windowGrid=()=>`<nav class="game-menu-windows" aria-label="${WINDOW_UI.rail}">${WINDOW_UI.windows.map(([id,name,icon])=>`<button type="button" data-shell="${id}" aria-label="${WINDOW_UI.open(name)}">${menuIcon(icon)}<span>${name}</span></button>`).join('')}</nav>`;
/** touch: ohne Tastatur erreicht man die Fenster nur über das Spielmenü; am Desktop haben sie eigene Tasten und die Menüleiste. */
/** Spielmenü nach WoW-Vorbild (2026-09-24): oben Einstellungen/Tastenbelegung/UI/Hilfe, dann Spielfenster, dann Heldenwahl/Abmelden,
 *  unten „Zurück zum Spiel“. Rechts steht die belegte Taste (Einstellungen → Tastenbelegung). */
const menuKey=id=>{const b=keysOf(liveKeymap(),id)[0];return b?`<kbd>${bindingLabel(b)}</kbd>`:'';};
const entry=(attrs,label,key='')=>`<button type="button" ${attrs}><span>${label}</span>${key}</button>`;
export function gameMenu({account=false,touch=false}={}){return `${touch?windowGrid():''}<div class="game-menu-actions">${entry('data-shell="settings"',MENU.settings,menuKey('options'))}${entry('data-shell="keybinds"',MENU.keybinds)}${entry('data-hud-open',HUD_TEXT.title)}${touch?'':entry('data-shell="guide"',MENU.help,menuKey('guide'))}${touch?entry('data-game-chat',MENU.chat):''}<hr class="game-menu-sep" aria-hidden="true">${entry('data-shell="professions"',MENU.professions,menuKey('professions'))}${entry('data-shell="mounts"',MOUNT_UI.title,menuKey('mounts'))}${entry('data-shell="companions"',COMPANION_TEXT.title,menuKey('companions'))}<hr class="game-menu-sep" aria-hidden="true">${entry('data-start-screen="roster"',START_UI.menuRoster)}${entry('data-start-screen="logout"',account?START_UI.menuLogout:START_UI.menuLogoutGuest)}<hr class="game-menu-sep" aria-hidden="true"><button type="button" class="gold-button" data-close>${MENU.resume}</button></div>`;}
