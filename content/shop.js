// Kalles Dorfladen: Preise bleiben bei den Gegenständen, Regeln und Texte hier.
export const SHOP_STOCK=['brezel','wasser','kaltgetraenk','currywurst','brauwasser','leerflasche'];
export const SHOP_RULES={range:56,keeperOffset:32,sellRate:.5,minSell:1,maxQuantity:99,buybackLimit:12,maxCoins:1e9};
export const SHOP_UI={
 title:'Kalles Kiosk',subtitle:'Der Dorfladen für den nächsten Fehltritt',npc:'kalle',marker:'Händler',
 interact:'Bei Kalle einkaufen',mapDetail:'Dorfladen · Verpflegung, Ankauf und Rückkauf',mapFilter:'Läden',mapSymbol:'K',
 buy:'Kaufen',sell:'Verkaufen',buyback:'Rückkauf',coins:'Pfandmarken',quantity:'Menge',each:'je Stück',
 stock:'Verpflegung und Brauzutaten für unterwegs. Der Vorrat geht Kalle nicht aus.',
 sellHint:'Kalle nimmt Material, Verpflegung und abgelegte Ausrüstung. Benötigtes Material für den laufenden Hauptauftrag bleibt geschützt.',
 buybackHint:'Die letzten 12 Verkäufe bleiben zum gleichen Preis rückkaufbar – auch nach dem Neuladen. Danach fällt jeweils der älteste heraus.',
 empty:'Hier liegt gerade nichts.',owned:'Im Rucksack',reserved:'Für den Hauptauftrag reserviert',
 neededLevel:n=>'Ab Stufe '+n,price:(n)=>n+' Pfandmarken',bag:(n,max)=>'Rucksack '+n+' / '+max,
 inventory:'Rucksack',notForSale:'Nicht verkäuflich',emptySlot:'Freier Platz',
 bagHint:'Rechtsklick oder Enter verkauft den Stapel sofort. Linksklick zeigt Details.',
 touchBagHint:'Antippen verkauft den Stapel sofort. Rückkauf links.',
 tradeHint:'Rechtsklick auf Ware kauft direkt. Die Menge steht am Artikel.',
 sellStack:(name,n,total)=>name+' × '+n+' · Verkaufen: '+total+' Pfandmarken',
 sellNow:'Stapel verkaufen',selectHint:'Gegenstand auswählen, um Werte und Verkaufspreis zu sehen.',
 far:'Kalle ist zu weit weg. Geh näher an seine Theke.',
 combat:'Erst den Kampf beenden, dann bei Kalle handeln.',dead:'Erst wieder aufstehen, dann einkaufen.',
 tutorial:'Erst die Hofprobe abschließen, dann geht es zum Kiosk.',paused:'Beende zuerst den UI-Bearbeitungsmodus.',
 invalid:'Diese Ware oder Menge ist nicht verfügbar.',money:'Dafür reichen deine Pfandmarken nicht.',
 full:'Für die ganze Menge fehlt Platz im Rucksack. Es wurde nichts gekauft.',
 protected:'Diese Menge fehlt oder ist für den Hauptauftrag reserviert.',limit:'Du kannst keine weiteren Pfandmarken tragen.',
 bought:(name,n)=>n+' × '+name+' eingepackt.',sold:(name,n)=>n+' × '+name+' verkauft. Rückkauf ist möglich.',
 recovered:(name,n)=>n+' × '+name+' zurückgekauft.',
 equipmentWarning:'Angelegte Gegenstände und Dorflegenden bleiben bei dir. Bauvorräte bitte vor dem Verkauf prüfen.',
 find:'Kalles Kiosk auf der Karte',closeReason:'Der Handel wurde beendet: '
};
