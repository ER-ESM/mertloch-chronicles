// Gesprächstexte. Quests bringen ihre eigenen Zeilen mit (quests.js). Hier: Hauptgeschichte (Ida je Kapitel), Sprüche der
// Mentoren an der Bude (HUB_TALK), Bosse, Feldgegner, Systemmeldungen.
// dialogue(npcId, state) liefert die passende Zeile; unbekannte Zustände fallen auf 'greet' zurück.
// Kapitel-Einträge haben: eyebrow, title, lines (Angebot), accept, decline, ongoing, reward, claimed. Kapitel 1 nutzt die
// Engine heute über intro/ongoing/reward/claimed direkt (app.js); Kapitel 2–4 folgen dem gleichen Muster unter ihrem Schlüssel.
import {STORY_CHAPTERS} from './story.js';
export const MAIN_DIALOGUE={
 ida:{
  // ---------- Kapitel 1 · Der übliche Verdächtige ----------
  intro:{eyebrow:'KISTEN-IDA · LOGISTIK AUF ZWEI PROMILLE',title:'Unterhose, Socke, Stempel. Und du willst was?',
   lines:['„Ich kenn hier jeden. Jeden, den ich schon mal rausgeschmissen hab, jeden, der mir Pfand schuldet, und jeden, der beides ist. Dich kenn ich nicht. Du lagst heute Morgen in unseren Trümmern, in Unterhose, mit unserem Stempel auf dem Arm und einem Pfandbon über <b>acht Cent</b>. Herzlichen Glückwunsch, du bist entweder Zeuge, Täter oder Sperrmüll.“',
    '„Für alle drei hab ich Verwendung. Die Bude ist hin, die Kiste ist weg, und <b>Ruhe 22:01 e. V.</b> war verdächtig schnell da, um „Beweise zu sichern“. Drei Pfandkeiler fressen gerade unsere Reste. Zwei Ruhewärter tragen den Rest weg. Und <b>Horst Nüchternmann</b> steht auf dem Feld in einem Panzer aus laminierten Hausordnungen und hält eine Beweismittelkiste fest.“',
    '„In der Kiste liegt unsere Anlage. Und deine Hose. Hol beides. Dann reden wir darüber, wer du bist. Wir brauchen keinen Auserwählten. Wir brauchen jemanden, der nicht schon wieder im Blumenbeet liegt.“'],
   accept:'Erst die Hose. Dann die Wahrheit.',decline:'Ich brauch erst mal ein Kaltgetränk. Und einen Namen.'},
  ongoing:{title:'Und? Hose schon dran?',line:'„Keiler, Ruhewärter, Horst. In der Reihenfolge. Die gelben Viecher draußen sind neutral – wenn du die anpöbelst, ist das dein Problem, du wandelnder Versicherungsfall. Und wenn dir unterwegs was einfällt, wer du bist: Ich will’s als Erste wissen. Ich hab ’ne Wette laufen.“',close:'Alles klar, Chefin.'},
  reward:{eyebrow:'POO-TANG LÄSST SICH NICHT ABSCHALTEN',title:'Horst hat ein Alibi. Du hast eine Hose.',
   lines:['„Horst hat um 22:01 Uhr die Polizei gerufen. Vom Festnetz. Wie jedes Jahr. Protokolliert, gelocht, abgeheftet. Der Mann hat ein Alibi aus Papier. Scheiße, ich hätte es ihm so gegönnt.“',
    '„Dafür lag in seiner Beweismittelkiste deine Hose. Drin: ein Busticket <b>Koblenz–Mertloch</b>, Samstag, 19:40. Und ein fremdes Handy, Sperrbildschirm „BASTIAN ♥ JENNY“. Du warst nicht allein.“',
    'Ida drückt dir den goldenen Dosenöffner in die Hand. Rückseite: <b>MERTLOCH BLEIBT WACH.</b> Schief graviert, Kevin war’s. „Teil eins bestanden. Teil zwei: Wir bauen die Bude wieder auf. Mit dir. Weil du sonst keine hast.“'],
   claim:'Poo-Tang. Bis die Boxen kotzen.'},
  claimed:{title:'Die Baustelle wartet.',line:'„Anlage zurück, Hose an, Horst zeigt sich selbst an. Jetzt fehlt nur noch alles andere. Dieter hat einen Bauplan auf einem Bierdeckel. Kevin hat Strom aus einer Quelle, die er nicht nennen will. Und Sperrmüll-Sigi hat unseren Tresen. Rate mal, wer den holt.“',close:'Alles klar, Chefin.'},
  // ---------- Kapitel 2 · Wiederaufbau mit Restpromille ----------
  wiederaufbau:{eyebrow:'KISTEN-IDA · BAULEITUNG',title:'Ohne Tresen kein Clan. Ohne Paletten kein Tresen.',
   lines:['„Sperrmüll-Sigi. Schrottplatz am Ortsrand. Ist Sonntagnacht mit dem Hänger durchs Dorf und hat alles mitgenommen, was auf der Straße lag. Unseren Tresen. Unsere Bänke. Kevins halbe Anlage. Nennt das Finderrecht. Ich nenn das Diebstahl mit Anhängerkupplung.“',
    '„Dieter braucht sechs Paletten für den neuen Tresen, die liegen bei Sigi. Auf der Baustelle hängen derweil Festzelt-Schnorrer rum und saufen unseren Bauzaun leer. Und irgendjemand muss Sigi erklären, dass ein Tresen kein Sperrmüll ist, sondern ein Familienmitglied.“',
    '„Bring Holz, verjag die Schnorrer, hol den Tresen. Und frag Sigi, was er Samstagnacht gesehen hat. Der Mann fährt nachts mit Licht aus und Augen auf.“'],
   accept:'Finderrecht ist Faustrecht.',decline:'Ich muss erst einen Bierdeckel unterschreiben.',
   ongoing:{title:'Wie steht die Bude?',line:'„Paletten, Schnorrer, Sigi. Dieter hat schon den Boden gefegt. Dreimal. Er nennt es Statik. Bring Holz, dann darf er endlich hämmern, bevor er anfängt, mich zu umarmen.“',close:'Alles klar, Chefin.'},
   reward:{eyebrow:'DER TRESEN STEHT. SCHIEF. ABER ER STEHT.',title:'Sigi hat gewunken. Der Kasten hat zurückgewunken.',
    lines:['„Sigi kam um drei mit dem Hänger. Da war die Bude schon hin. Aber er hat einen Bus wegfahren sehen, Koblenzer Kennzeichen, und hinten auf der Stoßstange <b>einen in Unterhose mit Bierkasten auf dem Kopf</b>. Sigi hat gewunken. Der Kasten hat zurückgewunken.“',
     '„Keiner sagt was. Anni macht ein Foto, Kevin fragt, ob der Kasten voll war. Wir bauen weiter: Tresen steht, Grill ist rund, Kevins Werkstatt ist ein Kühlschrank. Ab jetzt baust du mit – du bringst Material, satt werden wir alle.“'],
    claim:'Erst der Tresen. Dann der Kasten.'},
   claimed:{title:'Die Bude hat wieder eine Theke.',line:'„Dieter schläft unter dem Tresen. Aus Verbundenheit. Morgen kommt der Kegelclub aus Kalt, die haben angerufen und geschrien. Irgendwas mit „unsere Bahn“ und „ihr wart das“. Klingt nach Kapitel drei.“',close:'Alles klar, Chefin.'}},
  // ---------- Kapitel 3 · Alle Neune, kein Alibi ----------
  kegelclub:{eyebrow:'KISTEN-IDA · NACHBARSCHAFTSHILFE',title:'Kalt hat angerufen. Kalt hat geschrien.',
   lines:['„Der Kegelclub <b>„Alle Neune Kalt“</b>. Nachbardorf. Hassen uns seit dem Dorfpokal 2011, weil Dieter die Kugel behalten hat. Er sagt, er hat sie nur ausgeliehen. Er sagt das seit dreizehn Jahren. Ihre Kegelbahn wurde Samstagnacht zerlegt. Genau wie unsere Bude. Kegelkönig Klaus ist sicher: Das waren wir. Und er kommt mit dem ganzen Verein zum Festplatz, um es uns zu erklären.“',
    '„Leander braucht Kabel für die Anlage, und die einzigen brauchbaren im Umkreis liegen auf der Kegelbahn in Kalt. Zwischen den Trümmern. Zwischen den Keglern. Du siehst das Problem.“',
    '„Kegel die Brüder vom Festplatz, hol die Kabel, und dann redest du mit Klaus. Nicht mit den Fäusten. Also nicht nur. Der Mann hat was gesehen, das er selbst noch nicht versteht.“'],
   accept:'Dann kegeln wir zurück.',decline:'Ich geb die Kugel zurück. Ehrlich.',
   ongoing:{title:'Wie läuft das Nachbarschaftsgespräch?',line:'„Kegler, Kabel, Klaus. Leander steht mit offenen Kabelenden da und summt. Das ist kein gutes Zeichen. Bring die Kabel, bevor er sich selbst anschließt.“',close:'Alles klar, Chefin.'},
   reward:{eyebrow:'ALLE NEUNE. UND EINER IN UNTERHOSE.',title:'Zwölf weiße Shirts. Und deine Stimme.',
    lines:['„Klaus hat sie gesehen: zwölf Mann in weißen <b>GAME-OVER</b>-Shirts, die seine Bahn zerlegt haben, als der Bus falsch abbog. Mittendrin einer in Unterhose, der <b>„NEUES SPIEL!“</b> gebrüllt hat. Klaus hat es nachgemacht. Wir haben alle dich angeguckt.“',
     '„Du hast die Stimme erkannt, das stand dir im Gesicht. Also warst du dabei. Auf welcher Seite, klärt sich noch. Immerhin: Kabel haben wir, die Anlage läuft, und Dieter hat Klaus die Kugel zurückgegeben. Eine Kugel. Nicht die.“'],
    claim:'Neues Spiel.'},
   claimed:{title:'Kalt ist wieder Nachbar. Kein Freund. Nachbar.',line:'„Die Anlage steht, der Tresen hat Stufe zwei, und Bauer Berthold sagt, in seinem Feld steht seit Sonntag ein Bus. Der singt. Ich glaub, wir wissen jetzt, wo deine Freunde sind.“',close:'Alles klar, Chefin.'}},
  // ---------- Kapitel 4 · Der Bus nach nirgendwo ----------
  bus:{eyebrow:'KISTEN-IDA · ENDSTATION',title:'Der Bus steht im Feld. Der Bus singt.',
   lines:['„Berthold hat Recht. Ortsausgang, Feld links, Bus mit Koblenzer Kennzeichen. Tank leer, Fahrer weg, zwölf Junggesellen seit Samstag wach. Auf dem Dach ein Typ mit Schärpe und Bierbong, der jedem erklärt, dass der Junggesellenabschied erst vorbei ist, wenn <b>Bastian</b> heiratet. Bastian ist nicht da. Bastian ist auf deinem Handy. Also auf seinem. Du weißt, was ich meine.“',
    '„Polizeiobermeister Pit will keinen Papierkram und bittet um Amtshilfe. Ich will Antworten. Anni will ein Vorher-Nachher-Foto. Kevin will den Bus. Du willst wissen, wer du bist. Sammel die Junggesellen ein, sicher die Shirts als Beweise, und hol den Trauzeugen vom Dach.“',
    '„Und egal, was der Typ sagt: Du kommst danach zurück. Zur Bude. Hörst du? Wer mit uns kaputt macht, baut mit uns auf. Das ist die einzige Regel, die wir haben.“'],
   accept:'Endstation. Alle aussteigen.',decline:'Ich muss erst nachdenken. Das ist neu für mich.',
   ongoing:{title:'Wie geht’s dem Bus?',line:'„Junggesellen, Shirts, Timo. Pit sitzt auf der Motorhaube und tut so, als hätte er nichts gesehen. Das ist Amtshilfe auf Mertlocher Art. Hol den Trauzeugen runter, bevor er den Bus anzündet. Er hat’s angekündigt. Als Toast.“',close:'Alles klar, Chefin.'},
   reward:{eyebrow:'AKT 1 · FILMRISS · ENDE',title:'Du bist in den falschen Bus gestiegen. Willkommen im Clan.',
    lines:['„Timo hat dich erkannt. <b>Koblenz Hauptbahnhof, Samstag, 19:40.</b> Du hieltst den Bus für den Nachtbus. Bastians Shirt hast du gekriegt, weil Bastian gekotzt hat. Der Fahrer hat Kalt mit Mertloch verwechselt. Den Rest habt ihr mit uns gesoffen, bis es Streit um die Kiste gab.“',
     '„Die Unbekannten waren zwölf Junggesellen, ein sturzbetrunkener Clan – und du. Dieter hat den Tresen selbst umgetreten, der war eh morsch. Kevin hat die Anlage in Sigis Hänger gesichert, ohne Sigi. Anni hat gefilmt.“ Sie hält dir Timos Video hin: du, in Unterhose, die Kiste im Arm, und gibst sie einem Mann mit Pappkrone. Lachend.',
     '„Bastian hat die Kiste. Hochzeitsgeschenk. Samstag, Koblenz. Warum du sie ihm gegeben hast, weiß keiner.“ Sie schaut dich lange an. „Wer mit uns kaputt macht, baut mit uns auf. Du bist jetzt Poo-Tang. Nicht, weil wir dich mögen. Weil du uns was schuldest. Samstag holen wir die Kiste.“'],
    claim:'Poo-Tang. Bis die Kiste zurück ist.'},
   claimed:{title:'Akt 1 ist durch. Die Bude steht. Die Kiste nicht.',line:'„Bau die Bude aus, prügel dich durchs Umland, sammel deine Erinnerungen ein. Samstag fahren wir nach Koblenz. Kevin baut den Bus um. Dieter übt Reden. Anni sucht ein Outfit. Und du findest raus, warum du die Kiste hergegeben hast. Bis dahin: Mertloch bleibt wach.“',close:'Alles klar, Chefin.'}},
  // ---------- Altbestand (Akt 2, offen) ----------
  chapter2:{eyebrow:'KISTEN-IDA · ES GIBT EINE VORSITZENDE',title:'Horst war nur der Praktikant.',
   lines:['„Gisela Gießkanne. Erste Vorsitzende. Sie hat den Bürgermeister in der Tasche, das Ordnungsamt im Garten und unser Festzelt auf ihrer Abschussliste.“',
    '„Ihre Praktikanten laufen mit Klemmbrettern durch die Felder. Vertreib sie, hol Hedwigs Hopfen zurück, und dann besuchen wir die Dame in ihrem Beet.“'],
   accept:'Beet ist Beet. Fest ist Fest.',decline:'Ich brauch erst ein Kaltgetränk.'},
  chapter3:{eyebrow:'KISTEN-IDA · DAS DING NIMMT NICHTS AN',title:'Der Automat hat unser Leergut geschluckt.',
   lines:['„Ruhe 22:01 hat einen Pfandautomaten aufgestellt. Prototyp. Nimmt keine Dosen, keine Flaschen, keine Widerrede. Er hat Kevins Drohne gefressen.“',
    '„Wenn wir das Ding nicht abschalten, gibt es in Mertloch nie wieder Pfand. Und ohne Pfand keine Kiste. Und ohne Kiste …“ Sie schaut dich an. „Du weißt schon.“'],
   accept:'Dann bauen wir ihn um.',decline:'Erst die Drohne betrauern.'}
 }
};
/** Sprüche der Mentoren und Bewohner an der Bude, je Kapitel (1–4) und nach Aktschluss ('done'). Die UI zeigt eine Zeile
 * beim Ansprechen; 'greet' ist der Rückfall. Klamotten = Klassenwahl: Der Held trägt die Ersatzklamotten des Mentors. */
export const HUB_TALK={
 dieter:{greet:'„Meine Kutte. An dir. Sieht scheiße aus. Behalt sie.“',
  1:['„Ich hab den Tresen nicht umgetreten. Der Tresen ist gefallen. In meine Richtung. Mehrfach.“','„Ein Bierdeckel ist eine gültige Baugenehmigung. Steht so nirgends, aber es hat auch noch nie jemand widersprochen.“'],
  2:['„Sechs Paletten. Nicht fünf. Fünf ist ein Hocker. Sechs ist ein Tresen. Das ist Handwerk.“','„Sigi hat unseren Tresen. Sigi hat auch meinen Rasenmäher. Seit 2016. Wir reden nicht drüber.“'],
  3:['„Die Kugel ist geliehen. Dreizehn Jahre sind eine Leihfrist. Steht so nirgends.“','„Kalt hat uns 2011 beim Dorfpokal beschissen. Die hatten Kegel aus Blei. Beweisen kann ich’s nicht. Fühlen schon.“'],
  4:['„Ich hab Samstag mit einem Typen in Schärpe um die Wette gesoffen. Ich hab gewonnen. Glaub ich. Ich lag zuerst.“','„Der Tresen war eh morsch. Sag das keinem. Ich hab’s Ida schon gesagt. Sag’s trotzdem keinem.“'],
  done:['„Du hast mit uns kaputt gemacht. Du baust mit uns auf. Willkommen. Die Kutte kriegst du trotzdem nicht. Die ist geliehen.“']},
 baerbel:{greet:'„Meine Schürze. An dir. Vorher-Nachher-Foto? Nein? Ich mach trotzdem eins.“',
  1:['„Ich hab gestern Nacht nichts gesehen. Ich hab gefilmt. Das ist was anderes. Das Video ist leider … Story. Weg nach 24 Stunden. Sorry.“','„Du warst in Unterhose im Blumenbeet. Ich hab dich eingecremt. Bedank dich nicht, das war Werbung.“'],
  2:['„Wiederaufbau ist Content. Ich brauch Vorher-Fotos. Du bist gerade Vorher.“','„Sigi hat unsere Bänke. Sigi hat auch meinen Thermomix. Nein, warte, den hat Kevin. Zum Ausschlachten.“'],
  3:['„Kalt hat Kegelbrüder. Wir haben Aperol. Ich sehe da keinen fairen Kampf.“','„Klaus hat mir mal ein Vorher-Nachher-Foto zerrissen. Ich hab’s laminiert. Beides.“'],
  4:['„Zwölf Junggesellen. Zwölf potenzielle Vertriebspartner für die Putzpyramide. Ich seh das als Chance.“','„Der Typ mit der Schärpe hat mich Samstag „Tante“ genannt. Ich bin 34. Der wird nie wieder sauber.“'],
  done:['„Du bist jetzt Clan. Das heißt: Du putzt mit. Ich hab da ein Starterset. Nur 79 Euro.“']},
 kevin:{greet:'„Mein Gürtel. An dir. Wenn was rausfällt, ist das Absicht. Ich weiß nur noch nicht, welche.“',
  1:['„Die Anlage hab ich Samstag in Sicherheit gebracht. In Sigis Hänger. Ohne Sigi zu fragen. Das ist Logistik.“','„Dein Stempel ist echt. Unsere Tinte, unser Stempel, unsere Hand. Also warst du drin. Also hast du bezahlt. Also bist du Gast. Also bist du unser Problem.“'],
  2:['„Ich bau eine Werkstatt aus einem Kühlschrank. Strom hab ich. Frag nicht, woher. Frag lieber Elke, die weiß es und schweigt.“','„Bring Kabel. Nicht das gelbe. Das gelbe ist die Erde. Ich glaub.“'],
  3:['„Die Kegelbahn in Kalt hat Kabel für drei Anlagen. Die haben nur eine. Das ist Verschwendung. Wir helfen.“','„Klaus hat Bleikegel. Ich hab’s nachgemessen. Mit dem Pömpel. Wissenschaft.“'],
  4:['„Ein Bus. Tank leer. Zwölf Sitze. Ich seh da ein Clanmobil. Ida sieht ein Beweismittel. Wir einigen uns auf Clanmobil mit Beweisen drin.“','„Dein Handy ist Bastians Handy. Bastians Handy hat 400 Fotos von Samstag. Ich hab sie sortiert. Nach Promille.“'],
  done:['„Du bist jetzt Clan. Ich hab dir einen Chip in den Dosenöffner gebaut. Frag nicht. Er piept, wenn die Kiste in der Nähe ist. Hoffentlich.“']},
 kalle:{greet:'„Bargeld. Kein Pfand ohne Bon, kein Bon ohne Dose, keine Dose ohne Bargeld. Ist ganz einfach.“',
  1:['„Der Automat da drüben nimmt nichts an. Ich schon. Ich nehm sogar dich, wenn du Kleingeld hast.“','„Auf der Tafel steht seit Samstag ‚Quote gut, Ende schlecht‘. Das war keine Wette. Das war eine Beobachtung.“','„Das Radio läuft nur Kreisliga. Wenn du was anderes willst, kauf dir ein eigenes Radio. Kost’ bei mir zwölf Euro.“'],
  2:['„Der Bus hat mir die Kühltruhe leergesoffen. Die Kühltruhe. Nicht das Regal. Die Kühltruhe.“','„Baumaterial? Hab ich nicht. Hab Bockwurst. Ist auch tragend, wenn man sie lange genug liegen lässt.“','„Quote gut, Ende schlecht. Steht auf der Tafel, gilt auch für deine Bude.“'],
  3:['„Kalt setzt auf sich selbst. Das ist keine Wette, das ist Notwehr.“','„Ich nehm Wetten auf alles außer Kegeln. Kegeln ist manipuliert. Frag Dieter, der weint dann.“','„Kreisliga im Radio, Bier in der Truhe, Bargeld in der Kasse. Mehr Kiosk geht nicht.“'],
  4:['„Zwölf Mann in weißen Shirts, alle mit Karte zahlen wollen. Bei mir. Am Kiosk. Ich hab gelacht, bis einer geweint hat.“','„Einer hat meinen Trichter mitgenommen. Wenn du ihn findest: Er gehört mir, und der Typ gehört dir.“','„Wettannahme zu. Gegen den Bus setzt keiner mehr.“'],
  done:['„Du bist jetzt Clan. Heißt bei mir: gleicher Preis, aber du darfst drinnen stehen, wenn’s regnet.“'],
  tooExpensive:['„Zu teuer? Dann sammel Pfand wie alle anderen. Der Tresen ist kein Sozialamt.“']},
 ida:{greet:'„Rede nicht. Bau.“',done:['„Samstag. Koblenz. Die Kiste. Bis dahin: Bude ausbauen, Umland aufräumen, Erinnerungen sammeln.“']}
};
/** Sprüche der Bosse: Kampfbeginn, Phasen, Niederlage. Phasen stehen in enemies.js BOSSES.*.phases.*/
export const BOSS_LINES={
 horst:{engage:'Sie befinden sich in einer Ruhezone. Ich muss Sie bitten. Auch ohne Hose.',defeat:'Ich … lege Widerspruch ein. Und ich habe ein Alibi. Protokolliert.',playerDeath:'Vermerkt. Abgeheftet. Ruhe.'},
 sigi:{engage:'Lag auf der Straße. Gehört mir. Du auch, wenn du liegen bleibst.',defeat:'Nimm den Tresen. Nimm die Paletten. Aber den Rasenmäher kriegt Dieter nie.',playerDeath:'Sperrmüll. Wird Donnerstag abgeholt.'},
 klaus:{engage:'Poo-Tang! Ihr habt unsere Bahn zerlegt! Und die Kugel! DIE KUGEL!',defeat:'Zwölf weiße Shirts … und du hast „Neues Spiel“ geschrien. Das … das warst du. Nicht die.',playerDeath:'Pudel. Alle Neune. Nächster.'},
 timo:{engage:'DER JGA IST NICHT VORBEI! Bastian! BASTIAN! Wo ist Bastian?!',defeat:'Du bist der Nachtbus-Typ. Du hast die Kiste getragen. Ich hab’s gefilmt. Gib mir mein Handy, dann zeig ich’s dir.',playerDeath:'Auf Bastian! Und auf dich. Du liegst gut.'},
 gisela:{engage:'Auf meinem Rasen? Mit Schuhen?',defeat:'Meine Petunien … sagt Bernd, es tut mir leid.',playerDeath:'Ab auf den Kompost.'},
 automat:{engage:'FLASCHE EINFÜHREN. SIE SIND KEINE FLASCHE.',defeat:'STÖRUNG. BITTE WENDEN SIE SICH AN DAS PERSONAL. ES GIBT KEIN PERSONAL.',playerDeath:'NICHT ANGENOMMEN.'}
};
/** Sprüche menschlicher Feldgegner beim Angriff. */
export const ENEMY_BARKS={
 warden:['Das ist eine Ruhezone!','Ich hab’s dokumentiert.','22:01. Feierabend.'],
 scrounger:['Haste mal ’nen Euro?','Nur ’n Schluck. Ehrlich.','Ich geb’s dir Freitag zurück.'],
 inspector:['Ich bin nur Praktikant!','Das muss ich meinem Chef melden.','Absperrkegel sind Amtsgeräte!'],
 kegler:['Alle Neune!','Das ist für 2011!','Gib die Kugel zurück!','Pudel? PUDEL?!'],
 jga:['GAME OVER!','Auf Bastian!','Wo ist der Bus?','Ist das noch Samstag?','Ich hab keine Hose mehr. Du auch nicht. Bruder!']
};
/** Kurze Systemmeldungen, die Inhalt tragen (Engine-Toasts). */
export const SYSTEM_LINES={
 questDone:giver=>`Auftrag erfüllt. Kehre zu ${giver} zurück.`,
 gatherProgress:(n,max,item)=>`${n} / ${max} ${item} gesammelt.`,
 mainReady:'Die Trümmer sind sicher. Kehre zu Ida bei St. Gangolf zurück.',
 chapterReady:giver=>`Kapitel erledigt. Kehre zu ${giver} an die Bude zurück.`,
 welcome:'Unterhose. Eine Socke. Ein Stempel. Willkommen in Mertloch, wer immer du bist.',
 respawn:'Du erwachst bei St. Gangolf. Wieder. Diesmal wenigstens mit Hose.',
 levelUp:level=>'Stufe '+level+'! Neue Kniffe im Skillbuch, ein weiterer Talentpunkt.',
 memory:title=>'Erinnerungsfetzen: '+title,
 building:(name,stage)=>name+' ausgebaut · Stufe '+stage+'.',
 buildPlace:name=>`Gebaut wird an der Bude, nicht im Feld. ${name} wartet am Treffpunkt – und nicht mitten im Kampf.`
};
export function dialogue(npcId,state='greet'){const npc=MAIN_DIALOGUE[npcId];if(!npc)return null;return npc[state]||npc.greet||null;}
export const chapterDialogue=chapter=>MAIN_DIALOGUE.ida[STORY_CHAPTERS[chapter-1]?.dialogue]||null;
/** Zeile eines Mentors an der Bude: Kapitelzeile (deterministisch über index), nach Aktschluss 'done', sonst greet. */
export function hubLine(npcId,chapter=1,index=0,actDone=false){const t=HUB_TALK[npcId];if(!t)return null;const pool=actDone?t.done:t[chapter];return pool?.length?pool[Math.abs(index|0)%pool.length]:t.greet||null;}
