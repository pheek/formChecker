/***********************************************
 * Autor: philipp freimann / phi@freimann.eu
 * Datum: Okt. 2018
 ***********************************************/

/** 
 *  Registriere alle Felder des Input Formulars, welche geprüft werden müssen.
 *
 *  Felder, welche nicht geprüft werden müssen, können einfach die Funktion "NOT_REQUIRED" angeben; 
 *  solche Felder werden dann auch gleich formattiert wie die geprüften Felder (Fokus, Ränder, Farben, ...).
 *  Würde man die "not required" Felder nicht registrieren, würde das Formular natürlich genau gleich 
 *  funktionieren, jedoch müsste das CSS so angepasst werden, dass die Felder ergonomisch daher kommen.
 * 
 *  Die Funktion addField() erwartet:
 *   1. id des <input>-Feldes
 *   2. id des Label Feldes, das das Feld beschreibt. Dies wird rot markiert, wenn
 *      die Eingabe fehlt.
 *   3. Lesbarer Name des Feldes, damit die Meldung über fehlende oder fehlerhafte
 *      Eingaben gemacht werden kann.
 *   4. Testfunktion für das Feld.
 *      Die Testfunktion NOT_REQUIRED liefert immer "OK".
 *
 *      Felder welche nicht leer sein dürfen verwenden die Testfunktion "REQUIRED".
 *
 *      Alle anderen Funktionen liefern
 *             * "OK"  , sobald die Eingabe korrekt ist,
 *             * "ERR" , wenn die Eingabe Fehlerhafte Zeichen enthält und
 *             * "PART", die Eingabe ist zwar korrekt, aber noch nicht vollständig.
 */  

function registerFields() {
	var cf = new CheckFields("formID1", "submitID1", 'infoLabel', 'Bitte {FIELDS} korrekt eingeben.');
	
	cf.addField(   'nameFld',    'nameLbl', 'Name'        , 'REQUIRED'    );
	cf.addField('vornameFld', 'vornameLbl', 'Vorname'     , 'NOT_REQUIRED');
	cf.addField(    'plzFld',     'plzLbl', 'Postleitzahl', 'testPLZFld'  );
	cf.addField(    'ortFld',     'ortLbl', 'Ort'         , 'testOrtFld'  );
	// Folgender Aufruf ist da,
	// damit die Felder gleich beim Laden des Formulars markiert werden:
	cf.checkAllFields("");
}

/**
 * Testfunktionen (Feldprüfungsfunktionen) erhalten als Parameter 
 * den aktuellen Wert des entsprechenden Feldes.
 * Sie müssen einen der folgenden Rückgabewerte aufweisen:
 *
 *    OK    -> this field is ok
 *    PART  -> Entering. Is ok as part of OK
 *    ERR   -> Error: Field not OK
 */


/**
 * PLZ ist ok, falls es eine vierstellige Zahl ist.
 * Ein-, zwei- oder dreistellige Zahlen werden als "PART", also als
 * gültigen Eingabeteil vermerkt.
 * Alles andere ist ungültig "ERR".
 */
function testPLZFld(fldValue) {
	if(/^[1-9][0-9]{3}$/.test(fldValue.trim())) {
		return "OK";
	}
	if(/^[1-9][0-9]{0,2}$/.test(fldValue.trim())) {
		return "PART";
	}
	return "ERR";
}

/**
 * Orte enthalten Buchstaben, umlaute und einige 
 * andere Sonderzeichen.
 * Orte dürfen aber auch nicht nur aus Leerschlägen
 * bestehen.
 */
function testOrtFld(fldValue) {
	if("" == fldValue.trim()) {
		return "ERR";
	}
	// Zeichen, die im Ort vorkommen dürfen:
	if(/^[\wäöüßéèàáçÖÄÜ() ]+$/.test(fldValue)) {
		return "OK";
	}
	return "ERR";
}
