/***********************************************
 * Autor: philipp freimann / phi@freimann.eu
 * Datum: März 2009
 ***********************************************/
var FC_ALL_FORMS = new Array();

// Globale Funktion, welche alle Felder prüft.
// Diese wird von allen registrierten Listenern auf allen
// Eingabefeldern aufgerufen.
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


/**
 * + Die "formID" wird verwendet, damit für jedes Formular eine eigene
 *   Prüfung möglich ist.
 * + submitButtonID wird verwendet, um den Submit-Button zu "disablen",
 *   falls eine Eingabe noch fehlerhaft ist.
 * + infoLabelID ist die ID eines Paragraphen (oder generell eines HTML-Elements).
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
				id = evt.originalTarget.id;
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
			if("" != sup) {
				missingFieldsArr.push(sup);
				error = true;
			}
		}
		this.createStatusMsg(missingFieldsArr);
		var submitButton = document.getElementById(this.submitButtonID);
		submitButton.disabled = error;
	};


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


CheckFields.prototype.handleSingleField =
	function (currentField, currentLbl, activeFieldID) {
		var okFctName = this.fieldList[currentField]['testFieldFct'];
		var fld = document.getElementById(currentField);
		var fldValue = fld.value;
		var okFct = okFctName + '("' + fldValue + '")';
		var resultState = eval(okFct);
		var apString = 'passive';
		if(currentField == activeFieldID) {
			apString = 'active';
		}
		if("OK" == resultState) {
			this.colorizeFld(currentField, apString + " fc_ok_fld");
			this.colorizeLbl(currentLbl  ,             "fc_ok_lbl");
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


CheckFields.prototype.addField =
	function (fieldID, lblID, feldNameLesbar, testFieldFct) {
		var nextField = {'fieldID'       : fieldID       ,
										 'lblID'         : lblID         ,
		                 'feldNameLesbar': feldNameLesbar,
		                 'testFieldFct'  : testFieldFct  };
		this.fieldList[fieldID] =  nextField;
		this.registerListeners(nextField);
	};

/* debug only:
CheckFields.prototype.debugEchoList =
	function () {
		var i;
		var str = "";

		for(fld in this.fieldList) {
			str = str + this.fieldList[fld].fieldID + "(isOKFct: "+this.fieldList[fld]['testFieldFct']+")";
		}
		window.alert(str);
	};
*/
