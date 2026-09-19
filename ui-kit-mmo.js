import {escapeUi,uiIcon} from './ui-kit.js';

/** The real account form and showroom share this markup and its existing server hooks. */
export function uiLoginCard(labels,{preview=false}={}){
 const field=(name,label,type,autocomplete,extra='')=>`<label class="ui-field${name==='name'?' online-only-register':''}">${escapeUi(label)}<input name="${name}" type="${type}" autocomplete="${autocomplete}" ${extra}></label>`;
 return `<div class="online-card ui-panel mmo-login-card" data-ui-window-title="${escapeUi(labels.title)}"><div class="ui-row">${uiIcon('account',{size:40})}<h3>${escapeUi(labels.title)}</h3></div><p>${escapeUi(labels.intro)}</p><form data-online-form="login" class="online-form ui-stack"${preview?' data-ui-preview-form':''}>${field('email',labels.email,'email','email','required')}${field('password',labels.password,'password','current-password','required minlength="10"')}${field('name',labels.name,'text','nickname','minlength="3" maxlength="20"')}<div class="online-actions ui-row"><button type="submit" class="gold-button ui-button" data-ui-variant="primary" data-online-submit="login">${escapeUi(labels.login)}</button><button type="submit" class="outline-button ui-button" data-online-submit="register">${escapeUi(labels.register)}</button></div><p class="online-message" data-online-message role="status" aria-live="polite"></p></form>${preview?'<small class="mmo-preview-note">Designvorschau · keine Kontodaten eingeben. Es werden keine Daten gesendet.</small>':''}</div>`;
}

/** Switching modes before native validation makes the player-name field reachable immediately. */
export function setUiLoginMode(form,register){
 form.classList.toggle('registering',register);
 const name=form.querySelector('[name=name]');name.required=register;name.disabled=!register;
 form.querySelector('[name=password]').autocomplete=register?'new-password':'current-password';
 form.querySelector('[data-online-submit=register]').setAttribute('aria-pressed',String(register));
}

export function uiCharacterChoice(member,{selected=false}={}){
 return `<button type="button" class="ui-panel mmo-choice" data-ui-frame="character" data-ui-character="${escapeUi(member.id)}" aria-pressed="${selected}"><canvas width="192" height="192" data-ui-hero="${escapeUi(member.id)}" aria-label="${escapeUi(member.name)}"></canvas><strong>${escapeUi(member.name)}</strong><span>${escapeUi(member.role)}</span><small>${selected?'Ausgewählt':'Auswählen'}</small></button>`;
}

export async function paintUiHeroes(root,{visualEquipment=[]}={}){
 const [{loadRedesignArt,redesignArt},{drawDetailedHero}]=await Promise.all([import('./redesign-art.js'),import('./detailed-hero-art.js')]);
 await loadRedesignArt();if(!redesignArt.ready)return false;
 if(visualEquipment.length){const {loadContentArt}=await import('./content-art.js');await loadContentArt();}
 for(const canvas of root.querySelectorAll('[data-ui-hero]')){
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
  drawDetailedHero(ctx,canvas.dataset.uiHero,canvas.width/2,canvas.height*.88,{facing:1,visualEquipment},6);
 }return true;
}
