// Gesprächstexte. Quests bringen ihre eigenen Zeilen mit (quests.js). Hier: Hauptgeschichte (Ida je Kapitel), Sprüche der
// Mentoren an der Bude (HUB_TALK), Bosse, Feldgegner, Systemmeldungen.
// dialogue(npcId, state) liefert die passende Zeile; unbekannte Zustände fallen auf 'greet' zurück.
// Kapitel-Einträge haben: eyebrow, title, lines (Angebot), accept, decline, ongoing, reward, claimed. Kapitel 1 nutzt die
// Engine heute über intro/ongoing/reward/claimed direkt (app.js); Kapitel 2–4 folgen dem gleichen Muster unter ihrem Schlüssel.
import {STORY_CHAPTERS} from './story.js';
export const MAIN_DIALOGUE={
 ida:{
  // ---------- Kapitel 1 · Der übliche Verdächtige ----------
  intro:{eyebrow:'KISTEN-IDA · LOGISTIK AUF ZWEI PROMILLE',title:'Du trägst nur eine Unterhose. Und du willst etwas von mir?',
   lines:['„Ich kenne in diesem Dorf jeden: alle, die ich schon einmal rausgeschmissen habe, und alle, die mir noch Pfand schulden. Dich kenne ich nicht. Trotzdem lagst du heute Morgen in den Trümmern unserer Bude – in Unterhose, mit unserem Stempel auf dem Arm und einem Pfandbon über <b>acht Cent</b> in der Hand. Damit bist du entweder ein Zeuge, der Täter oder Sperrmüll.“',
    '„Zum Glück kann ich alle drei gebrauchen. Unsere Bude ist zerstört, die Kiste ist verschwunden, und der Verein <b>Ruhe 22:01 e. V.</b> war verdächtig schnell hier, um angeblich „Beweise zu sichern“. Gerade fressen drei Pfandkeiler unsere Reste, während zwei Ruhewärter wegtragen, was noch übrig ist. Und draußen auf dem Feld steht <b>Horst Nüchternmann</b> in einer Rüstung aus laminierten Hausordnungen und bewacht eine Beweismittelkiste.“',
    '„In dieser Kiste liegen unsere Musikanlage und deine Hose. Hol beides zurück, und danach reden wir darüber, wer du eigentlich bist. Einen Auserwählten brauchen wir hier nicht. Uns reicht jemand, der nicht gleich wieder im Blumenbeet einschläft.“'],
   accept:'Erst hole ich die Hose, dann suchen wir die Wahrheit.',decline:'Ich brauche erst einmal ein Kaltgetränk. Und einen Namen.'},
  ongoing:{title:'Und, hast du deine Hose schon wieder an?',line:'„Halte dich an die Reihenfolge: erst die Keiler, dann die Ruhewärter und zum Schluss Horst. Die gelb markierten Tiere draußen tun dir nichts, solange du sie in Ruhe lässt – wenn du sie trotzdem anpöbelst, ist das dein Problem, du wandelnder Versicherungsfall. Und falls dir unterwegs einfällt, wer du bist, will ich es als Erste erfahren, denn ich habe darauf gewettet.“',close:'Alles klar, Chefin.'},
  reward:{eyebrow:'POO-TANG LÄSST SICH NICHT ABSCHALTEN',title:'Horst hat ein Alibi, und du hast wieder eine Hose.',
   lines:['„Horst hat um 22:01 Uhr vom Festnetz aus die Polizei gerufen, so wie jedes Jahr. Der Anruf ist protokolliert, gelocht und abgeheftet – der Mann hat also ein Alibi aus Papier. Schade, ich hätte ihm die Sache wirklich von Herzen gegönnt.“',
    '„Dafür lag in seiner Beweismittelkiste deine Hose, und in der Hosentasche steckte ein Busticket <b>Koblenz–Mertloch</b> für Samstag, 19:40 Uhr. Außerdem war ein fremdes Handy darin, auf dessen Sperrbildschirm „BASTIAN ♥ JENNY“ steht. Du warst an dem Abend also nicht allein unterwegs.“',
    'Ida drückt dir einen goldenen Dosenöffner in die Hand. Auf der Rückseite steht etwas schief eingraviert: <b>MERTLOCH BLEIBT WACH.</b> Die Gravur stammt offensichtlich von Kevin. „Den ersten Teil hast du bestanden. Im zweiten Teil bauen wir die Bude wieder auf, und du hilfst mit – du hast ja sonst kein Zuhause.“'],
   claim:'Poo-Tang. Bis die Boxen kotzen.'},
  claimed:{title:'Die Baustelle wartet auf dich.',line:'„Die Anlage ist zurück, du hast deine Hose wieder an, und Horst zeigt sich vor lauter Ordnungsliebe gerade selbst an. Jetzt fehlt uns nur noch alles andere. Dieter hat seinen Bauplan auf einen Bierdeckel gemalt, Kevin hat Strom aus einer Quelle, die er nicht verraten will, und unser Tresen steht bei Sperrmüll-Sigi. Rate mal, wer ihn zurückholen darf.“',close:'Alles klar, Chefin.'},
  // ---------- Kapitel 2 · Wiederaufbau mit Restpromille ----------
  wiederaufbau:{eyebrow:'KISTEN-IDA · BAULEITUNG',title:'Ohne Paletten gibt es keinen Tresen – und ohne Tresen keinen Clan.',
   lines:['„Sperrmüll-Sigi betreibt den Schrottplatz am Ortsrand. In der Nacht auf Sonntag ist er mit seinem Anhänger durchs Dorf gefahren und hat alles eingesammelt, was auf der Straße lag: unseren Tresen, unsere Bänke und Kevins halbe Musikanlage. Er nennt das Finderrecht. Ich nenne das Diebstahl mit Anhängerkupplung.“',
    '„Dieter braucht sechs Paletten für den neuen Tresen, und die liegen ebenfalls bei Sigi. Gleichzeitig lungern auf unserer Baustelle Festzelt-Schnorrer herum und trinken uns die letzten Vorräte weg. Außerdem muss jemand Sigi erklären, dass ein Tresen kein Sperrmüll ist, sondern zur Familie gehört.“',
    '„Bring also das Holz mit, verjag die Schnorrer und hol unseren Tresen zurück. Frag Sigi bei der Gelegenheit, was er in der Samstagnacht beobachtet hat. Der Mann fährt nachts ohne Licht, aber mit sehr offenen Augen durch die Gegend.“'],
   accept:'Wenn er mit Finderrecht kommt, komme ich mit Faustrecht.',decline:'Ich muss vorher noch einen Bierdeckel unterschreiben.',
   ongoing:{title:'Wie weit ist die Bude?',line:'„Du kümmerst dich um die Paletten, die Schnorrer und Sigi. Dieter hat inzwischen dreimal den Boden gefegt und nennt das Statik. Bring ihm Holz, damit er endlich hämmern darf – sonst fängt er vor lauter Langeweile noch an, mich zu umarmen.“',close:'Alles klar, Chefin.'},
   reward:{eyebrow:'DER TRESEN STEHT WIEDER. SCHIEF, ABER ER STEHT.',title:'Sigi hat gewunken, und der Bierkasten hat zurückgewunken.',
    lines:['„Sigi sagt, er sei erst um drei Uhr nachts mit dem Anhänger gekommen, und da war die Bude schon zerstört. Er hat aber einen Bus mit Koblenzer Kennzeichen wegfahren sehen. Hinten auf der Stoßstange stand <b>jemand in Unterhose mit einem Bierkasten auf dem Kopf</b>. Sigi hat ihm gewunken, und der Kasten hat zurückgewunken.“',
     'Alle schauen dich an, aber keiner sagt etwas. Anni macht ein Foto, und Kevin möchte nur wissen, ob der Kasten voll war. „Wir bauen jedenfalls weiter: Der Tresen steht, der Grill ist wieder rund, und Kevins Werkstatt ist ein umgebauter Kühlschrank. Ab jetzt baust du mit. Du bringst das Material, und dafür wirst du bei uns satt.“'],
    claim:'Erst kommt der Tresen dran, dann der Typ mit dem Kasten.'},
   claimed:{title:'Die Bude hat wieder eine Theke.',line:'„Dieter schläft neuerdings unter dem Tresen, weil er sich ihm so verbunden fühlt. Morgen bekommen wir übrigens Besuch vom Kegelclub aus Kalt. Die haben angerufen und ins Telefon gebrüllt, irgendetwas mit „unsere Bahn“ und „ihr wart das“. Das klingt für mich nach dem nächsten Kapitel.“',close:'Alles klar, Chefin.'}},
  // ---------- Kapitel 3 · Alle Neune, kein Alibi ----------
  kegelclub:{eyebrow:'KISTEN-IDA · NACHBARSCHAFTSHILFE',title:'Kalt hat angerufen, und Kalt hat gebrüllt.',
   lines:['„Der Kegelclub <b>„Alle Neune Kalt“</b> kommt aus dem Nachbardorf und hasst uns seit dem Dorfpokal 2011, weil Dieter damals ihre Kugel behalten hat. Er behauptet seit dreizehn Jahren, er habe sie nur ausgeliehen. In der Samstagnacht wurde ihre Kegelbahn genauso zerlegt wie unsere Bude. Kegelkönig Klaus ist überzeugt, dass wir das waren, und deshalb kommt er mit dem ganzen Verein zum Festplatz, um uns das persönlich zu erklären.“',
    '„Dazu kommt ein zweites Problem: Leander braucht Kabel für die Anlage, und die einzigen brauchbaren Kabel weit und breit liegen auf der Kegelbahn in Kalt – mitten in den Trümmern und mitten zwischen wütenden Keglern.“',
    '„Vertreib also die Kegelbrüder vom Festplatz, hol die Kabel und rede danach mit Klaus. Versuch es bitte nicht nur mit den Fäusten. Der Mann hat in jener Nacht etwas gesehen, das er selbst noch nicht richtig versteht.“'],
   accept:'Dann kegeln wir eben zurück.',decline:'Ich gebe ihnen die Kugel zurück. Ehrlich.',
   ongoing:{title:'Wie läuft das Gespräch mit den Nachbarn?',line:'„Deine Aufgaben sind die Kegler, die Kabel und Klaus. Leander steht schon mit offenen Kabelenden in der Hand da und summt vor sich hin, und das ist kein gutes Zeichen. Bring ihm die Kabel, bevor er sich aus Versehen selbst anschließt.“',close:'Alles klar, Chefin.'},
   reward:{eyebrow:'ALLE NEUNE – UND EINER IN UNTERHOSE',title:'Klaus erinnert sich an zwölf weiße Shirts und an deine Stimme.',
    lines:['„Klaus hat die Täter gesehen: Es waren zwölf Männer in weißen Shirts mit der Aufschrift <b>GAME OVER</b>. Ihr Bus war falsch abgebogen, und daraufhin haben sie seine Kegelbahn zerlegt. Mittendrin stand einer in Unterhose, der ständig <b>„NEUES SPIEL!“</b> gebrüllt hat. Klaus hat uns den Ruf vorgemacht, und danach haben wir alle dich angeschaut.“',
     '„Du hast deine eigene Stimme wiedererkannt, das konnte man dir ansehen. Du warst also dabei – auf wessen Seite, finden wir noch heraus. Immerhin haben wir jetzt die Kabel, die Anlage läuft, und Dieter hat Klaus eine Kugel zurückgegeben. Es war irgendeine Kugel, nicht die von damals.“'],
    claim:'Neues Spiel.'},
   claimed:{title:'Kalt ist wieder unser Nachbar, aber noch lange kein Freund.',line:'„Die Anlage steht, und der Tresen hat Stufe zwei erreicht. Außerdem erzählt Bauer Berthold, dass seit Sonntag ein Bus in seinem Feld steht, aus dem gesungen wird. Ich glaube, wir wissen jetzt, wo deine Freunde stecken.“',close:'Alles klar, Chefin.'}},
  // ---------- Kapitel 4 · Der Bus nach nirgendwo ----------
  bus:{eyebrow:'KISTEN-IDA · ENDSTATION',title:'Im Feld steht ein Bus, und aus dem Bus wird gesungen.',
   lines:['„Berthold hatte recht: Am Ortsausgang steht links im Feld ein Bus mit Koblenzer Kennzeichen. Der Tank ist leer, der Fahrer ist verschwunden, und die zwölf Junggesellen darin sind seit Samstag wach. Auf dem Dach sitzt ein Kerl mit Schärpe und Bierbong, der jedem erklärt, der Junggesellenabschied sei erst vorbei, wenn <b>Bastian</b> geheiratet hat. Bastian selbst ist aber nicht da. Wir kennen ihn nur von dem Handy aus deiner Hose, das eigentlich seines ist.“',
    '„Polizeiobermeister Pit hat keine Lust auf Papierkram und bittet uns deshalb um Amtshilfe. Ich will endlich Antworten, Anni will ein Vorher-Nachher-Foto, Kevin will den Bus behalten, und du willst wissen, wer du bist. Sammle also die Junggesellen ein, sichere ihre Shirts als Beweismittel und hol den Trauzeugen vom Dach.“',
    '„Und egal, was dir der Kerl da oben erzählt: Du kommst danach zu uns an die Bude zurück, hörst du? Wer mit uns etwas kaputt macht, der baut es auch mit uns wieder auf. Das ist die einzige Regel, die wir haben.“'],
   accept:'Endstation. Alle aussteigen, bitte.',decline:'Ich muss erst nachdenken. Das ist neu für mich.',
   ongoing:{title:'Wie sieht es am Bus aus?',line:'„Du brauchst die Junggesellen, ihre Shirts und am Ende Timo. Pit sitzt derweil auf seiner Motorhaube und tut so, als sähe er nichts – so funktioniert Amtshilfe in Mertloch. Hol den Trauzeugen vom Dach, bevor er den Bus anzündet. Das hat er nämlich schon angekündigt, und zwar als Trinkspruch.“',close:'Alles klar, Chefin.'},
   reward:{eyebrow:'AKT 1 · FILMRISS · ENDE',title:'Du bist in den falschen Bus gestiegen. Willkommen im Clan.',
    lines:['„Timo hat dich sofort wiedererkannt. Du bist am <b>Samstag um 19:40 Uhr am Koblenzer Hauptbahnhof</b> eingestiegen, weil du den Partybus für den Nachtbus gehalten hast. Bastians Shirt hast du bekommen, nachdem Bastian sich übergeben hatte. Der Fahrer hat dann Kalt mit Mertloch verwechselt, und den Rest des Abends habt ihr mit uns durchgesoffen – bis der Streit um die Kiste losging.“',
     '„Die Unbekannten, die wir gesucht haben, waren also zwölf Junggesellen, unser eigener sturzbetrunkener Clan – und du. Den Tresen hat Dieter selbst umgetreten, weil er sowieso morsch war. Kevin hat die Anlage in Sigis Anhänger in Sicherheit gebracht, ohne Sigi zu fragen. Und Anni hat alles gefilmt.“ Ida hält dir Timos Video hin. Darauf stehst du in Unterhose mit der Kiste im Arm und überreichst sie lachend einem Mann mit Pappkrone.',
     '„Bastian hat jetzt unsere Kiste, als Hochzeitsgeschenk. Er heiratet am Samstag in Koblenz. Warum du sie ihm gegeben hast, weiß niemand.“ Sie schaut dich lange an. „Wer mit uns etwas kaputt macht, baut es mit uns wieder auf. Du gehörst ab jetzt zu Poo-Tang – nicht, weil wir dich so gern haben, sondern weil du uns etwas schuldest. Am Samstag holen wir die Kiste zurück.“'],
    claim:'Poo-Tang. Bis die Kiste zurück ist.'},
   claimed:{title:'Akt 1 ist geschafft: Die Bude steht, nur die Kiste fehlt noch.',line:'„Bau bis dahin die Bude weiter aus, räum im Umland auf und sammle deine restlichen Erinnerungen ein. Am Samstag fahren wir nach Koblenz: Kevin baut dafür den Bus um, Dieter übt seine Rede, und Anni sucht sich ein Outfit aus. Du findest in der Zwischenzeit heraus, warum du die Kiste überhaupt hergegeben hast. Und bis dahin gilt: Mertloch bleibt wach.“',close:'Alles klar, Chefin.'}},
  // ---------- Altbestand (Akt 2, offen) ----------
  chapter2:{eyebrow:'KISTEN-IDA · ES GIBT EINE VORSITZENDE',title:'Horst war nur der Praktikant.',
   lines:['„Die eigentliche Chefin heißt Gisela Gießkanne und ist die Erste Vorsitzende von Ruhe 22:01. Sie hat den Bürgermeister in der Tasche und das Ordnungsamt auf ihrer Seite, und unser Festzelt steht ganz oben auf ihrer Abschussliste.“',
    '„Ihre Praktikanten laufen mit Klemmbrettern durch die Felder und schreiben alles auf. Vertreib sie und hol Hedwigs Hopfen zurück. Danach besuchen wir die Dame in ihrem Blumenbeet.“'],
   accept:'Ein Beet ist ein Beet, aber ein Fest ist ein Fest.',decline:'Ich brauche erst ein Kaltgetränk.'},
  chapter3:{eyebrow:'KISTEN-IDA · DAS DING NIMMT NICHTS AN',title:'Der Automat hat unser Leergut geschluckt.',
   lines:['„Ruhe 22:01 hat einen Pfandautomaten aufgestellt, angeblich einen Prototyp. Er nimmt weder Dosen noch Flaschen an und lässt auch nicht mit sich reden. Dafür hat er Kevins Drohne gefressen.“',
    '„Wenn wir das Ding nicht abschalten, gibt es in Mertloch nie wieder Pfand. Ohne Pfand können wir die Kiste nicht füllen, und ohne Kiste …“ Sie schaut dich an. „Du weißt schon.“'],
   accept:'Dann bauen wir ihn eben um.',decline:'Erst möchte ich um die Drohne trauern.'}
 }
};
/** Sprüche der Mentoren und Bewohner an der Bude, je Kapitel (1–4) und nach Aktschluss ('done'). Die UI zeigt eine Zeile
 * beim Ansprechen; 'greet' ist der Rückfall. Klamotten = Klassenwahl: Der Held trägt die Ersatzklamotten des Mentors. */
export const HUB_TALK={
 dieter:{greet:'„Das ist meine Kutte, die du da trägst. Sie sieht an dir scheiße aus, aber behalt sie ruhig.“',
  1:['„Ich habe den Tresen nicht umgetreten. Er ist von ganz allein umgefallen – zufällig in meine Richtung, und das mehrmals.“','„Ein Bierdeckel ist eine gültige Baugenehmigung. Das steht zwar nirgends geschrieben, aber es hat mir auch noch nie jemand widersprochen.“'],
  2:['„Ich brauche sechs Paletten und nicht fünf. Aus fünf wird nur ein Hocker, erst aus sechs wird ein Tresen. So viel Handwerk muss sein.“','„Sigi hat unseren Tresen, und meinen Rasenmäher hat er schon seit 2016. Darüber reden wir beide aber nicht.“'],
  3:['„Die Kugel habe ich mir nur geliehen. Dreizehn Jahre sind eine völlig normale Leihfrist, auch wenn das nirgends steht.“','„Kalt hat uns 2011 beim Dorfpokal betrogen, die hatten Kegel aus Blei. Beweisen kann ich das nicht, aber ich spüre es bis heute.“'],
  4:['„Am Samstag habe ich mit einem Kerl in Schärpe um die Wette gesoffen. Ich glaube, ich habe gewonnen – jedenfalls lag ich als Erster am Boden.“','„Der Tresen war sowieso morsch, aber erzähl das bitte keinem. Ida weiß es schon von mir, erzähl es trotzdem keinem.“'],
  done:['„Du hast mit uns alles kaputt gemacht, also baust du es auch mit uns wieder auf. Willkommen im Clan! Die Kutte bleibt trotzdem nur geliehen.“']},
 baerbel:{greet:'„Du trägst ja meine Schürze! Wie wäre es mit einem Vorher-Nachher-Foto? Nein? Ich mache trotzdem eins.“',
  1:['„Ich habe gestern Nacht nichts gesehen, ich habe nur gefilmt – das ist ein Unterschied. Leider war das Video eine Story, und die löscht sich nach 24 Stunden von selbst. Sorry.“','„Du lagst in Unterhose im Blumenbeet, und ich habe dich mit Sonnencreme eingecremt. Du musst dich nicht bedanken, das war Werbung für meine Produkte.“'],
  2:['„Der Wiederaufbau ist guter Content, und dafür brauche ich Vorher-Fotos. Du siehst gerade sehr nach Vorher aus.“','„Sigi hat unsere Bänke und auch meinen Thermomix. Nein, warte – den Thermomix hat Kevin, der wollte ihn ausschlachten.“'],
  3:['„Kalt schickt Kegelbrüder, und wir haben Aperol. Das wird kein fairer Kampf – für die.“','„Klaus hat mir einmal ein Vorher-Nachher-Foto zerrissen. Ich habe danach beide Hälften laminiert und aufgehängt.“'],
  4:['„Da draußen sitzen zwölf Junggesellen, und ich sehe darin zwölf mögliche Vertriebspartner für meine Putzmittel-Pyramide. Das ist eine echte Chance.“','„Der Kerl mit der Schärpe hat mich am Samstag „Tante“ genannt. Ich bin 34! Dem verkaufe ich nie wieder ein Putzmittel.“'],
  done:['„Du gehörst jetzt zum Clan, und das heißt, du putzt auch mit. Ich hätte da ein passendes Starterset für dich, es kostet nur 79 Euro.“']},
 kevin:{greet:'„Das ist mein Werkzeuggürtel, den du da trägst. Falls unterwegs etwas herausfällt, ist das Absicht – ich weiß nur noch nicht, welche.“',
  1:['„Die Anlage habe ich am Samstag in Sicherheit gebracht, und zwar in Sigis Anhänger. Sigi habe ich vorher nicht gefragt. So etwas nennt man Logistik.“','„Dein Stempel ist echt, denn das ist unsere Tinte und unser Stempel. Du warst also auf dem Fest und hast Eintritt bezahlt. Damit bist du unser Gast – und deshalb jetzt auch unser Problem.“'],
  2:['„Ich baue mir eine Werkstatt aus einem alten Kühlschrank. Strom habe ich schon, aber frag mich nicht, woher. Elke weiß es, und Elke schweigt.“','„Bring mir bitte Kabel mit, nur nicht das gelbe. Das gelbe ist die Erdung, glaube ich zumindest.“'],
  3:['„Auf der Kegelbahn in Kalt liegen genug Kabel für drei Musikanlagen, dabei haben die nur eine. Das ist Verschwendung, und da helfen wir gern beim Aufbrauchen.“','„Klaus spielt wirklich mit Bleikegeln. Ich habe das mit dem Pömpel nachgemessen, das ist also wissenschaftlich belegt.“'],
  4:['„Ich sehe einen Bus mit leerem Tank und zwölf Sitzen, also ein Clanmobil. Ida sieht darin nur ein Beweismittel. Wir haben uns geeinigt: Es wird ein Clanmobil mit Beweismitteln an Bord.“','„Das Handy aus deiner Hose gehört Bastian, und darauf sind 400 Fotos von Samstag. Ich habe sie schon sortiert – nach Promille.“'],
  done:['„Du gehörst jetzt zum Clan. Ich habe dir deshalb einen Chip in den Dosenöffner eingebaut, der piept, sobald die Kiste in der Nähe ist. Hoffe ich jedenfalls.“']},
 kalle:{greet:'„Bei mir zahlt man bar. Pfand gibt es nur mit Bon, einen Bon gibt es nur mit Dose, und eine Dose gibt es nur gegen Bargeld. Eigentlich ganz einfach.“',
  1:['„Der Pfandautomat da drüben nimmt überhaupt nichts an. Ich dagegen nehme alles – sogar dich, wenn du Kleingeld dabeihast.“','„Auf meiner Wett-Tafel steht seit Samstag „Quote gut, Ende schlecht“. Das war gar keine Wette, das war nur meine Beobachtung vom Fest.“','„In meinem Radio läuft ausschließlich Kreisliga. Wenn du etwas anderes hören willst, kauf dir ein eigenes Radio. Bei mir kostet eins zwölf Euro.“'],
  2:['„Die Leute aus dem Bus haben mir die komplette Kühltruhe leergetrunken. Wohlgemerkt die ganze Truhe, nicht nur ein Regalfach!“','„Baumaterial führe ich nicht, aber ich habe Bockwurst. Wenn man sie lange genug liegen lässt, trägt die auch eine Wand.“','„Auf meiner Tafel steht „Quote gut, Ende schlecht“, und das gilt genauso für eure Bude.“'],
  3:['„Die Kegler aus Kalt wetten immer nur auf sich selbst. Das ist keine Wette mehr, das ist Notwehr.“','„Ich nehme Wetten auf alles an, nur nicht aufs Kegeln, denn Kegeln ist manipuliert. Frag mal Dieter danach – aber dann fängt er an zu weinen.“','„Im Radio läuft Kreisliga, in der Truhe liegt Bier und in der Kasse liegt Bargeld. Mehr kann ein Kiosk nicht bieten.“'],
  4:['„Da standen zwölf Mann in weißen Shirts an meinem Kiosk und wollten alle mit Karte zahlen. Bei mir! Ich habe so lange gelacht, bis einer von ihnen geweint hat.“','„Einer von denen hat meinen Trichter mitgenommen. Wenn du den Kerl findest: Der Trichter gehört mir, und der Kerl gehört dir.“','„Die Wettannahme ist geschlossen. Gegen den Bus will sowieso keiner mehr setzen.“'],
  done:['„Du gehörst jetzt zum Clan. Bei mir zahlst du trotzdem denselben Preis, aber dafür darfst du dich bei Regen drinnen unterstellen.“'],
  tooExpensive:['„Das ist dir zu teuer? Dann sammle Pfand wie alle anderen auch. Mein Kiosk ist schließlich kein Sozialamt.“']},
 ida:{greet:'„Rede nicht so viel, bau lieber etwas.“',done:['„Am Samstag fahren wir nach Koblenz und holen die Kiste. Bis dahin baust du die Bude aus, räumst im Umland auf und sammelst deine Erinnerungen ein.“']}
};
/** Sprüche der Bosse: Kampfbeginn, Phasen, Niederlage. Phasen stehen in enemies.js BOSSES.*.phases.*/
export const BOSS_LINES={
 horst:{engage:'Sie befinden sich in einer Ruhezone, und ich muss Sie bitten zu gehen. Das gilt auch für Personen ohne Hose.',defeat:'Ich … lege hiermit Widerspruch ein! Außerdem habe ich ein Alibi, und das ist protokolliert.',playerDeath:'Das wird vermerkt und abgeheftet. Und jetzt ist endlich Ruhe.'},
 sigi:{engage:'Was auf der Straße liegt, gehört mir. Das gilt auch für dich, wenn du gleich liegen bleibst.',defeat:'Na gut, nimm den Tresen und nimm die Paletten. Aber den Rasenmäher bekommt Dieter niemals zurück!',playerDeath:'Das ist jetzt Sperrmüll und wird am Donnerstag abgeholt.'},
 klaus:{engage:'Poo-Tang! Ihr habt unsere Bahn zerlegt! Und ihr habt immer noch die Kugel! DIE KUGEL!',defeat:'Zwölf weiße Shirts … und du hast „Neues Spiel“ geschrien. Das … das warst ja du! Das waren gar nicht die anderen.',playerDeath:'Das war ein Pudel. Ich werfe alle Neune. Der Nächste, bitte!'},
 timo:{engage:'DER JUNGGESELLENABSCHIED IST NICHT VORBEI! Bastian! BASTIAN! Wo ist Bastian?!',defeat:'Moment, du bist doch der Typ, der zum Nachtbus wollte! Du hast die Kiste getragen, ich habe es gefilmt. Gib mir mein Handy, dann zeige ich es dir.',playerDeath:'Ein Prosit auf Bastian! Und eins auf dich, du liegst da wirklich gut.'},
 gisela:{engage:'Sie laufen über meinen Rasen? Und das auch noch mit Schuhen?',defeat:'Meine schönen Petunien … Sagt Bernd, dass es mir leidtut.',playerDeath:'Sie kommen jetzt auf den Kompost.'},
 automat:{engage:'BITTE FLASCHE EINFÜHREN. SIE SIND KEINE FLASCHE.',defeat:'STÖRUNG. BITTE WENDEN SIE SICH AN DAS PERSONAL. ES GIBT KEIN PERSONAL.',playerDeath:'NICHT ANGENOMMEN.'}
};
/** Sprüche menschlicher Feldgegner beim Angriff. */
export const ENEMY_BARKS={
 warden:['Das ist eine Ruhezone!','Ich hab’s dokumentiert.','22:01. Feierabend.'],
 scrounger:['Haste mal ’nen Euro?','Nur ’n Schluck. Ehrlich.','Ich geb’s dir Freitag zurück.'],
 inspector:['Ich bin nur Praktikant!','Das muss ich meinem Chef melden.','Absperrkegel sind Amtsgeräte!'],
 kegler:['Alle Neune!','Das ist für 2011!','Gib die Kugel zurück!','Pudel? PUDEL?!'],
 jga:['GAME OVER!','Auf Bastian!','Wo ist der Bus?','Ist das noch Samstag?','Ich hab keine Hose mehr. Du auch nicht. Bruder!'],
 // Elite der Außenbezirke (ELITES.oberpraktikant). Die Engine wählt über e.archetype – bei Eliten ist das der Elite-Schlüssel.
 oberpraktikant:['Das ist hier keine Fläche für so etwas.','Ich mache einen Vermerk. In dreifacher Ausfertigung.','Mein Anleiter kommt gleich. Dann reden wir anders.','Ich darf das. Steht hier. Hab ich selbst geschrieben.']
};
/** Kurze Systemmeldungen, die Inhalt tragen (Engine-Toasts). */
export const SYSTEM_LINES={
 questDone:giver=>`Auftrag erfüllt. Kehre zu ${giver} zurück.`,
 gatherProgress:(n,max,item)=>`${n} / ${max} ${item} gesammelt.`,
 mainReady:'Die Trümmer sind gesichert. Kehre zu Ida bei St. Gangolf zurück.',
 chapterReady:giver=>`Kapitel erledigt. Kehre zu ${giver} an die Bude zurück.`,
 welcome:'Du trägst eine Unterhose, eine einzelne Socke und einen Stempel auf dem Arm. Willkommen in Mertloch, wer immer du bist.',
 respawn:'Du wachst schon wieder bei St. Gangolf auf – diesmal wenigstens mit Hose.',
 levelUp:level=>'Stufe '+level+' erreicht! Im Skillbuch warten neue Kniffe, und du hast einen weiteren Talentpunkt.',
 memory:title=>'Erinnerungsfetzen: '+title,
 building:(name,stage)=>name+' ausgebaut · Stufe '+stage+'.',
 buildPlace:name=>`Bauen kannst du nur an der Bude und nicht mitten im Kampf. ${name} wartet dort am Treffpunkt auf dich.`,
 // Auto-Loot: lootFull meldet, was nicht mehr in den Rucksack passt (liegt dann unter „Ausrüstung zurückholen“);
 // autoLoot ist der kurze Toast je eingesammelter Beute. Wortlaut von lootFull ist mit rpg.js abgestimmt.
 lootFull:n=>`Rucksack voll · ${n} Fundstück${n===1?'':'e'} warten unter „Ausrüstung zurückholen“.`,
 autoLoot:(name,count)=>`Eingesteckt: ${name}${count>1?' ×'+count:''}.`
};
export function dialogue(npcId,state='greet'){const npc=MAIN_DIALOGUE[npcId];if(!npc)return null;return npc[state]||npc.greet||null;}
export const chapterDialogue=chapter=>MAIN_DIALOGUE.ida[STORY_CHAPTERS[chapter-1]?.dialogue]||null;
/** Zeile eines Mentors an der Bude: Kapitelzeile (deterministisch über index), nach Aktschluss 'done', sonst greet. */
export function hubLine(npcId,chapter=1,index=0,actDone=false){const t=HUB_TALK[npcId];if(!t)return null;const pool=actDone?t.done:t[chapter];return pool?.length?pool[Math.abs(index|0)%pool.length]:t.greet||null;}
