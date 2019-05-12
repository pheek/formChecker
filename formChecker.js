/***********************************************
 * Autor: philipp freimann / phi@freimann.eu
 * Datum: Okt. 2018
 *
 * Full example see: github.com/pheek/formChecker
 ***********************************************/
var FC_ALL_FORMS = new Array();

/** 
 * checkAllFields ist eine globale Funktion, welche alle Felder prüft.
 * Die Funktion muss von allen Listeners (hooks, onXYZ-Funktionen)
 * aufgerufen werden können.
 * Auf allen Eingabefeldern wird diese Funktion für 
 * diverse Listener registriert.
 * Die registrierten Listener sind in der Funktion 
 * CheckFields.registerListeners() zu sehen.
 */
function checkAllFields(evt, formID) {
	var formChecker = FC_ALL_FORMS[formID];
	formChecker.checkAllFields(evt);
}


/**
 * Felder, welche optional sind oder nicht geprüft werden,
 * verwenden "NOT_REQUIRED". Die Antwort ist immer "OK".
 */
function NOT_REQUIRED(fldValue) {
	return "OK"; // immer ok, da nicht required
}

/**
 * REQUIRED sagt, dass ein Feld nicht leer sein darf.
 * Achtung: Nur Leerschläge (white spaces/tabs/...) gelten auch als leer.
 */
function REQUIRED(fldValue) {
	if("" == fldValue.trim()) {
		return("ERR");
	}
	return "OK";
}


function IS_INTEGER(fldValue) {
	var trimmed = fldValue.trim();
	if("" == trimmed) {
		return ("ERR");
	}
	if("-" == trimmed) {
		return("PART");
	}
	if("+" == trimmed) {
		return("PART");
	}
	if(trimmed * 1 == trimmed) {
		return("OK");
	}
	return ("ERR");
}

/**
 * Teste ob E-Mailadresse im gültigem Format
 * -----------------------------------------
 * - Gültig sind Ziffern, Buchstaben, Underscores ("_" = Bodenstrich) und das Minuszeichen.
 * - Ebenso muss eine E-Mail nach dem letzten Punkt zwei Zeichen enthalten.
 * - Ein Punkt ist minimal nach dem @ Zeichen vorgesehen.
 * - E-Mails dürfen in spitzen Klammern  angegeben werden. Bsp.:  <abc@dada.net>
 * - Auf die zusammengesetzte Form mit den Anführungszeichen (") wurde noch
 *   verzichtet. Bsp.:   "Hans Muster" <hans.muster@purplewin.ch>
 *   Dies könnte noch als Option hinzugefügt werden.
 */

function TEST_EMAIL(fldValue) {
	var mail = fldValue.trim();

	// Behandle offensichtliche Fehler:
	// Leerstring ist nicht OK:
	if('' == mail) {return "ERR";}
	
	// Zwei Punkte hintereinander nach dem @:
	if(/^.*@.*\.\..*$/.test(mail)) {return "ERR";}

	// Die folgenden Fälle sind OK
	// Alles korrekt inkl. zwei Buchstaben am Schluss. einmal mit <> einmal ohne
	// Top-Level Domain enthält weder '_' noch '-'
	if( /^[-\._0-9a-zA-Z]+\@([-_0-9a-zA-Z]+\.)+[0-9a-zA-Z]{2,}$/ .test(mail)) { return "OK"  ; }
	// auch mit Spitzen Klammern ok:
	if(/^<[-\._0-9a-zA-Z]+\@([-_0-9a-zA-Z]+\.)+[0-9a-zA-Z]{2,}>$/.test(mail)) { return "OK"  ; }

	// auch mit Name voran in "" eingeschlossen ok:
  if(/^(\u0022[^\u0022]+\u0022)? *<[-\._0-9a-zA-Z]+\@([-_0-9a-zA-Z]+\.)+[0-9a-zA-Z]{2,}>$/.test(mail)) { return "OK"  ; }

	  if(/^(\u0022[^\u0022]+\u0022)?( *(<([-\._0-9a-zA-Z]+(\@(([-_0-9a-zA-Z]+\.?)+([0-9a-zA-Z]+)?)?)?)?)?)?$/.test(mail)) { return "PART"  ; }

	// Als Teil OK, also OK während der Eingabe
	if(/^<?[-\._0-9a-zA-Z]*(\@[-\._0-9a-zA-Z]*)?$/.test(mail)) { return "PART"; }

	// Alles andere wird als falsch angesehen
	return "ERR";
}


/**
 * + Die "formID" wird verwendet, damit für jedes Formular eine eigene
 *   Prüfung möglich ist.
 * + submitButtonID wird verwendet, um den Submit-Button zu "disablen",
 *   falls eine Eingabe noch fehlerhaft ist.
 * + infoLabelID ist die ID eines Paragraphen
 *   (oder generell eines HTML-Elements).
 *   In dieses "infoLabel" wird der Fehlertext hineingeschrieben.
 * + infoLabelText gibt den Text an, der angezeigt wird, wenn ein oder
 *   mehrere Felder noch nicht korrekt sind. Der Platzhalter "{FIELDS}"
 *   wird dabei durch die Namen der fehlerhaften Felder ersetzt.
 */
function CheckFields(formID, submitButtonID, infoLabelID, infoLabelText) {
	this.formID          = formID        ;
	this.submitButtonID  = submitButtonID;
	this.infoLabelID     = infoLabelID   ;
	this.infoLabelTxt    = infoLabelText ;
	this.fieldList       = new Array()   ;
	FC_ALL_FORMS[formID] = this          ;
}


/**
 * 'registerField' registriert ein Feld für die Prüfung des Inhaltes.
 * Bei jeder Veränderung des Inhaltes (onChange, onKeyup, ...)
 * werden alle hiermit registrierten Felder geprüft, ob der 
 * Inhalt korrekt ist.
 * @fieldID: die ID des <input>-Feldes.
 * @lblID  : die ID des Labels, das neben dem <input> Feld steht.
 *           Dieses Feld kann somit die Farbe ändern und dem
 *           Anwender klar machen, wenn noch eine Eingabe nicht
 *           korrekt ist.
 * @feldNameLesbar: Der Name des Feldes in lesbarer Form für den
 *                  Anwender. Dies ist wichtig für die Meldung
 *                  beim Submit-Button: "Bitte ... korrekt eingeben."
 * @testFieldFct: Die Funktion, welche das Feld auf Korrektheit prüft.
 */
CheckFields.prototype.registerField =
	function (fieldID, lblID, feldNameLesbar, testFieldFct) {
		var nextField = {'fieldID'       : fieldID       ,
		                 'lblID'         : lblID         ,
		                 'feldNameLesbar': feldNameLesbar,
		                 'testFieldFct'  : testFieldFct  };
		this.fieldList[fieldID] =  nextField;
		this.registerListeners(nextField);
	};


/**
 * Diese Funktion schreibt einen Meldungstext ins infoLabel. Dieser Text
 * zeit an, welche Felder noch fehlerhaft sind. Dabei wird der "infoLabelText" aus
 * dem Konstruktor verwendet. Die Felder werden durch Kommata getrennt,
 * wobei die letzten beiden Felder durch das Wort " und " getrennt werden.
 */
CheckFields.prototype.createStatusMsg =
	function(missingFieldsArray) {
		var lblPara = document.getElementById(this.infoLabelID);
		if(missingFieldsArray.length > 0) {
			var msgString = "";
			for(var i = 0; i < missingFieldsArray.length; i++) {
				if(0 == i) {
					msgString = missingFieldsArray[0];
				} else {
					if(missingFieldsArray.length - 1 == i) {
						msgString = msgString + " und " + missingFieldsArray[i];
					} else {
						msgString = msgString + ", " + missingFieldsArray[i];
					}
				}
			}
			lblPara.innerHTML = this.infoLabelTxt.replace("{FIELDS}", msgString);
		} else {
			lblPara.innerHTML = ""; // Fehlermsg löschen
		}
	};


CheckFields.prototype.checkAllFields =
	function(evt) {
		var missingFieldsArr = new Array();
		var id = "";
		if("" != evt) {
			if(evt.type != 'paste') {
				console.log("event" + evt + " type:" + evt.type);
				/**
				 * Danke N. Péray: Chrome kennt originalTarget nicht,
				 * Daher target, statt Firefox "originalTarget".
				 */
				//id = evt.originalTarget.id;
				id = evt.target.id;
			} else {
				// Problem: paste-Event wird geworfen, BEVOR der Text im Feld
				// eingetragen wird. Mit SetTimeout 20 (20ms) ist der Text danach aber
				// im Feld und kann geprüft werden.
				setTimeout('checkAllFields("", "'+this.formID+'")', 20);
			}
		}
		var error = false;
		for(fld in this.fieldList) {
			var lblID = this.fieldList[fld]['lblID'];
			var sup = this.handleSingleField(fld, lblID, id);
			if('' != sup) {
				missingFieldsArr.push(sup);
				error = true;
			}
		}
		this.createStatusMsg(missingFieldsArr);
		var submitButton = document.getElementById(this.submitButtonID);
		submitButton.disabled = error;
	};


/**
 * valid colors are 'fld_ok_<lbl|fld>'
 *                  'fld_err_<lbl|fld>'
 * and              'fld_part_<lbl|fld>'
 */
CheckFields.prototype.colorizeFld =
	function(fldID, className) {
		var fld = document.getElementById(fldID);
		fld.setAttribute('class', className);
	};


CheckFields.prototype.colorizeLbl =
	function(lblID, className) {
		var lbl = document.getElementById(lblID);
		lbl.setAttribute('class', className);
	};


/**
 * Some input Value has to be cleaned.
 * Especially the Appos (") must be replaced,
 * because the okFct is evaluated.
 * It must not be possible to end the argument to the
 * ocFunction (eg. IS_EMAIL("") by simply entering an
 * appos; or even more [ ... "); whatever_evil_code(); ...].
 * In this security sense, each appostrophe is replaced by \".
 */
CheckFields.prototype.cleanAppos =
	function(fldValue) {
		var cleanedValue
		cleanedValue = fldValue    .replace(/\\/g, '\\\\' );
		cleanedValue = cleanedValue.replace(/"/g , '\\"'  );
		return cleanedValue;
	};


/**
 * Colorize the field an labels.
 * In addition, missing or not finished (PART) values are
 * stored in the fieldList. More precise: This function returns
 * the visiualized name of a field.
 * If the field is correct (passes the test), then an
 * empty string ('') is returned.
 */
CheckFields.prototype.colorizeFldAndLbl =
	function(resultState, currentField, currentLbl, apString) {
		if("OK" == resultState) {
			this.colorizeFld(currentField, apString + " fc_ok_fld" );
			this.colorizeLbl(currentLbl  ,             "fc_ok_lbl" );
		}
		if("ERR" == resultState) {
			this.colorizeFld(currentField, apString + " fc_err_fld");
			this.colorizeLbl(currentLbl  ,             "fc_err_lbl");
			return this.fieldList[currentField]['feldNameLesbar'];
		}
		if("PART" == resultState) {
			this.colorizeFld(currentField, apString + " fc_part_fld");
			this.colorizeLbl(currentLbl  ,             "fc_part_lbl");
			return this.fieldList[currentField]['feldNameLesbar'];
		}
		return '';
	};


CheckFields.prototype.handleSingleField =
	function (currentField, currentLbl, activeFieldID) {
		var okFctName   = this.fieldList[currentField]['testFieldFct'];
		var fld         = document.getElementById(currentField)       ;
		var fldValue    = this.cleanAppos(fld.value)                  ;

		var okFct       = okFctName + '("' + fldValue + '")'          ;
		var resultState = eval(okFct)                                 ;
		var apString    = 'passive'                                   ;
		if(currentField == activeFieldID) {
			apString = 'active';
		}
		return this.colorizeFldAndLbl(resultState, currentField, currentLbl, apString);
	};


CheckFields.prototype.registerListeners =
	function(field) {
		var ele = document.getElementById(field.fieldID);
		var fctName = 'checkAllFields(event, "'+this.formID+'");';
		ele.setAttribute('onpaste' , fctName);
		ele.setAttribute('onkeyup' , fctName);
		ele.setAttribute('onblur'  , fctName);
		ele.setAttribute('onchange', fctName);
		ele.setAttribute('onfocus' , fctName);
	};
