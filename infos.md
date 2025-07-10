
!!! things to do 
make the cookies in backend protected with cookie-parser middleware


personel
-fiche de base
mise a jour societe
choix de sco
param socie
service
type de contrat
qualification
banque soc

-banque
code, num compte, banque(liste), description

-societe(db)
edit
code(random), designation, adresse, immaticule fiscal, registre de commerce, timbre


-parameter(db) (depends on every societ)
edit
code, raison social, num CNSS, adress, personelParamId, socParamId, intervalParamId 
personelParamId tab: nombre de moins, TFP, foprolos, cnss, fonction pro, taux d'acc, CSS
socParamId tab: chef de famille, enfnat 1, enfant 2, enfant 3, enfant 4, enfant anticepe, enfant non bursable
intervalParamId tab: slaire_bas, max_sal, pourcentage


-personel(db)
id, nom et prenom, CIN, num CNSS, adress, date de recrutement, date naissance, qualification(list get by api), service, categorie(list get by api), echelon(list get by api), categorie avance(), nature(), debut, fin


-choix de societe(functionality)

-interval(db)
edit

-qualification (db)
...every list lust be a call api so we get a data 

-prime(db) FUTURE
andha rel avec person et soc

slaire de base
