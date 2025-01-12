﻿'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const fs = require('fs');
const { stringify } = require('querystring');

const { Server } = require("socket.io");


/*var routes = require('./routes/index');
var users = require('./routes/users');*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/users', function (req, res) {
    res.send('POST request to the page + ' + req.body.name + ' ' + saveUserInscription(req.body.name));
});

//sauvegarde à la fin du fichier json contenant les utilisateurs
function saveUserInscription(fileToSave) {
    fs.readFile(path.join(__dirname, "public/docs/name.json"), function (err, data) {
        var jsonObj = JSON.parse(data);
        var keys = Object.keys(jsonObj.members);
        //création d'un nouveau user
        var i = keys.length + 1;
        var newUser = "user" + i;
        var newValue = fileToSave;
        jsonObj.members[newUser] = newValue;
        try {
            fs.writeFileSync(path.join(__dirname, "public/docs/name.json"), JSON.stringify(jsonObj));
            return newUser;
        } catch (e) {
            return "failed sign in";
        }
    })
}

//à la première connexion --> direction la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/chat.html"));
});

app.get('/users', function (req, res) {
    res.send('GET request to the page');
});

//app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', 1337);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});

const io = new Server(server);

// ------------------------------------ PARTIE LOVER LETTER -----------------------------------------------
//id carte - image - nom - description
const NOCARD = [-1, "", "PAS DE CARTE", "Vous n'avez pas de carte dans cette main."]
const ESPIONNE = [0, "img/0Espionne.jpg", "Espionne", "Si vous êtes le seul joueur en vie ayant joué ou défaussé une espionne durant la manche, vous gagnez 1 point supplémentaire."]
const GARDE = [1, "img/1Garde.jpg", "Garde", "Devinez la carte d'un autre joueur pour l'éliminer (vous ne pouvez pas citer le Garde)."]
const PRETRE = [2, "img/2Pretre.jpg", "Pretre", "Regardez la main d'un joueur de votre choix."]
const BARON = [3, "img/3Baron.jpg", "Baron", "Comparez la carte de votre main avec celle d'un Jersaire. Celui qui a la carte la plus faible est éliminé."]
const SERVANTE = [4, "img/4Servante.jpg", "Servante", "Aucun joueur ne peut vous cibler ce tour-ci."]
const PRINCE = [5, "img/5Prince.jpg", "Prince", "Défaussez la carte d'un joueur (y compris vous-même)."]
const CHANCELIER = [6, "img/6Chancelier.jpg", "Chancelier", "Piochez la première carte du paquet et rejouez."]
const ROI = [7, "img/7Roi.jpg", "Roi", "Échangez votre carte avec un autre joueur."]
const COMTESSE = [8, "img/8Comtesse.jpg", "Comtesse", "Si vous possédez un Prince (5) ou un Roi (7), vous devez jouer la Comtesse."]
const PRINCESSE = [9, "img/9Princesse.jpg", "Princesse", "Si cette carte est jouée ou défaussée, son propriétaire est éliminé."]
const CARDLIST = [ESPIONNE, GARDE, PRETRE, BARON, SERVANTE, PRINCE, CHANCELIER, ROI, COMTESSE, PRINCESSE]

//identification du joueur
var j0id = "";
var j1id = "";
var j2id = "";
var j3id = "";
var j4id = "";

var mainJ0 = [NOCARD, NOCARD];
var mainJ1 = [NOCARD, NOCARD];
var mainJ2 = [NOCARD, NOCARD];
var mainJ3 = [NOCARD, NOCARD];
var mainJ4 = [NOCARD, NOCARD];
var historiqueJ0 = [];
var historiqueJ1 = [];
var historiqueJ2 = [];
var historiqueJ3 = [];
var historiqueJ4 = [];
//id joueur - statut (1 = en vie, 0 = mort) - main - dernière carte jouée - historique des cartes jouées - socket.id du joueur
var J0 = [0, 1, mainJ0, "", historiqueJ0,""];
var J1 = [1, 1, mainJ1, "", historiqueJ1,""];
var J2 = [2, 1, mainJ2, "", historiqueJ2,""];
var J3 = [3, 1, mainJ3, "", historiqueJ3,""];
var J4 = [4, 1, mainJ4, "", historiqueJ4,""];
var listeJoueurs = [J0, J1, J2, J3, J4];

//algorithme de Fisher-Yates pour mélanger une liste
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function initDeck() {
    DECK = [ESPIONNE, ESPIONNE
        , GARDE, GARDE, GARDE, GARDE, GARDE, GARDE
        , PRETRE, PRETRE
        , BARON, BARON
        , SERVANTE, SERVANTE
        , PRINCE, PRINCE
        , CHANCELIER, CHANCELIER
        , ROI
        , COMTESSE
        , PRINCESSE]
    return shuffle(DECK);
}

let DECK = [];

let NBJOUEURS = 5;

let tourActuel = listeJoueurs[0];

function tourSuivant() {
    //détermine le prochain joueur à jouer
    var tourAcheve = tourActuel;
    //on repart du joueur actuel et on parcours la liste
    for (var i = tourActuel[0] + 1; i <= NBJOUEURS; i++) {
        if (listeJoueurs[i][1] == 1) { //si le joueur est en vie
            tourActuel = listeJoueurs[i];
            break;
        }
    }
    //si c'est le dernier joueur du tour alors on recommence à zéro pour trouver le prochain jour
    if (tourActuel == tourAcheve) {
        for (var i = 0; i <= NBJOUEURS; i++) {
            if (listeJoueurs[i][1] == 1) { //si le joueur est en vie
                tourActuel = listeJoueurs[i];
                break;
            }
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//fonction pour assigner et afficher une carte à un joueur
function getCard(idCard, emplacement, joueur) {
    for (let index = 0; index < CARDLIST.length; index++) {
        if (idCard == index) {
            joueur[2][emplacement] = CARDLIST[index];
            break;
        }
    }
}

function getCardInHand(joueur) {
//fonction pour trouver quelle carte le joueur a en main
    if (joueur[2][0][0] == NOCARD[0]) {
        return joueur[2][1];
    }
    else return joueur[2][0];
}

function pioche(joueur) {
//piocher = enlever la première carte du deck et l'assigner au joueur
    //on vérifie que le joueur est vivant
    if (joueur[1] == 1) {
        //joueur[2] 0 = carte de gauche -- joueur[2] 1 = carte de droite
        if (joueur[2][0] == NOCARD) {
            //récupérer la carte correspondante
            getCard(DECK[0][0], 0, joueur);
            //enlever la carte piochée du deck
            DECK.splice(0, 1);
        } else if (joueur[2][1] == NOCARD) {
            getCard(DECK[0][0], 1, joueur);
            DECK.splice(0, 1);
        }
    }
    //mettre à jour le nombre de cartes dans le deck
    return DECK.length;
}

//à vérifier
function hasWon(listeJoueurs) {
    meilleurCarte = NOCARD;
    //penser aux cas d'égalité (tableau)
    joueursGagnants = NONE;
    if (listeJoueurs.length === 1) {
        return listeJoueurs[0];
    } else {
        listeJoueurs.forEach(joueur => {
            if (meilleurCarte < getCardInHand(joueur)) {
                meilleurCarte = getCardInHand(joueur);
                joueursGagnants = joueur;
            }
        });
    }
}

function validerJouer(joueur, carteJouee, emplacement) {
    //on historise la carte jouée dans la liste
    joueur[4].push(carteJouee[2]);
    //on log la dernière carte jouée (pour effets de cartes)
    joueur[3] = carteJouee;

    //on nettoie l'affichage de l'emplacement  
    joueur[2][emplacement] = NOCARD;

    //verifier la victoire
    //hasWon(listeJoueurs);
}

function jouer(joueur, carteJouee, emplacement, joueurCible, roleCible) {
    //effet des cartes
    //idée : enlever les gens morts de la liste des gens vivants
    io.emit('loveLetterChat message', "GAME INFO: Le joueur " + joueur[5] + " a joué " + carteJouee[2] + " en ciblant le joueur " + joueurCible + " et le role " + roleCible);
    if (carteJouee[0] == GARDE[0]) {
        var roleReelJoueurCible = getCardInHand(listeJoueurs[joueurCible])[2].toLowerCase();
        if (roleReelJoueurCible == roleCible.toLowerCase()) {
            //document.getElementById("player" + listeJoueurs[joueurCible][0] + "Card1").innerHTML = "Joueur décédé.";
            io.emit('loveLetterChat message', "GAME INFO: Le joueur " + joueurCible + " a été éliminé");
            listeJoueurs[joueurCible][1] = 0;
        }
        //valider l'action
        validerJouer(joueur, carteJouee, emplacement);

    } else if (carteJouee[0] == PRETRE[0]) {
        validerJouer(joueur, carteJouee, emplacement);

    } else if (carteJouee[0] == BARON[0]) {
        if (listeJoueurs[joueurCible][3] != SERVANTE && joueurCible != "0" && listeJoueurs[joueurCible][1] == 1) {
            //on valide le fait de jouer avant d'appliquer les effets du baron
            validerJouer(joueur, carteJouee, emplacement);
            //joueur vivant se trouve avec l'id
            var forceJoueurCible = getCardInHand(listeJoueurs[joueurCible])[0];
            var forceInitiateur = getCardInHand(listeJoueurs[joueur[0]])[0];
            //le joueur ciblé meure s'il est moins fort
            if (forceInitiateur > forceJoueurCible) {
                listeJoueurs[joueurCible][1] = 0;
            } else if (forceInitiateur < forceJoueurCible) {
                listeJoueurs[joueur[0]][1] = 0;
            }
        }

    } else if (carteJouee[0] == PRINCE[0]) {
        if ((listeJoueurs[joueurCible][3] != SERVANTE && listeJoueurs[joueurCible][1] == 1) || joueurCible == "0") {
            validerJouer(joueur, carteJouee, emplacement);
            //on indique quelle carte a été défaussée
            var carteDefaussee = getCardInHand(listeJoueurs[joueurCible]);
            listeJoueurs[joueurCible][4].push(carteDefaussee[2]);
            //si la princesse est défaussée son propriétaire est mort
            if (carteDefaussee == PRINCESSE) {
                listeJoueurs[joueur[0]][1] = 0;
                document.getElementById("player" + listeJoueurs[joueurCible][0] + "Card1").innerHTML = "Joueur décédé.";
                //sinon on vide sa main et on repioche une carte
            } else {
                listeJoueurs[joueurCible][2][0] = NOCARD;
                listeJoueurs[joueurCible][2][1] = NOCARD;
                pioche(listeJoueurs[joueurCible]);
            }
        }

    } else if (carteJouee[0] == CHANCELIER[0]) {
        validerJouer(joueur, carteJouee, emplacement);
        pioche(joueur);

    } else if (carteJouee[0] == ROI[0]) {
        if (listeJoueurs[joueurCible][3] != SERVANTE && listeJoueurs[joueurCible][1] == 1 && joueurCible != "0") {
            validerJouer(joueur, carteJouee, emplacement);
            //on prend les cartes des deux joueurs
            var carteJoueurCible = getCardInHand(listeJoueurs[joueurCible]);
            var carteInitiateur = getCardInHand(listeJoueurs[joueur[0]]);
            //on échange les cartes des deux joueurs et on vide la main droite
            getCard(carteInitiateur[0], 0, listeJoueurs[joueurCible]);
            getCard(NOCARD[0], 0, listeJoueurs[joueurCible]);
            getCard(carteJoueurCible[0], 0, listeJoueurs[joueur[0]]);
            getCard(NOCARD[0], 0, listeJoueurs[joueur[0]]);
        }

        //la princesse est impossible à jouer
    } else if (carteJouee[0] == PRINCESSE[0]) { }

    else {
        validerJouer(joueur, carteJouee, emplacement);
    }

    //au final on passe au joueur suivant
    if (carteJouee != CHANCELIER) {
        tourSuivant();
    }    
}


function newGame(nbJoueurs) {
    //on réinitialise tout
    DECK = initDeck();
    NBJOUEURS = nbJoueurs;
    mainJ0 = [NOCARD, NOCARD];
    mainJ1 = [NOCARD, NOCARD];
    mainJ2 = [NOCARD, NOCARD];
    mainJ3 = [NOCARD, NOCARD];
    mainJ4 = [NOCARD, NOCARD];
    historiqueJ0 = [];
    historiqueJ1 = [];
    historiqueJ2 = [];
    historiqueJ3 = [];
    historiqueJ4 = [];
    J0 = [0, 1, mainJ0, "", historiqueJ0, j0id];
    J1 = [1, 1, mainJ1, "", historiqueJ1, j1id];
    J2 = [2, 1, mainJ2, "", historiqueJ2, j2id];
    J3 = [3, 1, mainJ3, "", historiqueJ3, j3id];
    J4 = [4, 1, mainJ4, "", historiqueJ4, j4id];
    listeJoueurs = [J0, J1, J2, J3, J4];

    //on enlève une carte au hasard
    var carteEnlevee = getRandomInt(0, 21);
    //document.getElementById("deckcontent").innerHTML = "Carte enlevée : " + DECK[carteEnlevee][2];
    DECK.splice(carteEnlevee, 1);

    //on fait piocher le premier joueur
    pioche(J0);
    pioche(J1);
    pioche(J2);
    pioche(J3);
    pioche(J4);
}

function getPlayerFromName(name) {
    if (J0[5]==name) {
        return J0;
    } else if (J1[5] == name) {
        return J1;
    }
    else if (J2[5] == name) {
        return J2;
    }
    else if (J3[5] == name) {
        return J3;
    }
    else if (J4[5] == name) {
        return J4;
    }
}

// ------------------------------------ PARTIE SOCKET -----------------------------------------------

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('register', (userName) => {
        saveUserInscription(userName);
        socket.id = userName;
        var idJoueurActuel = J0;

        //attribution des joueurs par ordre d'arrivée
        if (j0id == "") {
            j0id = userName;
            idJoueurActuel = J0;
        } else if (j1id == "") {
            j1id = userName;
            idJoueurActuel = J1;
        } else if (j2id == "") {
            j2id = userName;
            idJoueurActuel = J2;
        } else if (j3id == "") {
            j3id = userName;
            idJoueurActuel = J3;
        } else if (j4id == "") {
            j4id = userName;
            idJoueurActuel = J4;
        }

        console.log("user saved in db with name " + socket.id);
        var usersConnected = Array.from(io.sockets.sockets.values());
        var idUsersConnected = new Array(usersConnected.length);
        for (var i = 0; i < usersConnected.length; i++) {
            idUsersConnected.push(usersConnected[i].id);
        }
        io.emit("register", [idUsersConnected,idJoueurActuel, userName]);
    });

    socket.on('jouer', (jeu) => {
        //jeu = [nomJoueur, carteJouee, emplacement, joueurCible, roleCible]
        jouer(getPlayerFromName(jeu[0]),jeu[1], jeu[2], jeu[3], jeu[4]);
        io.emit('jouer', [listeJoueurs, tourActuel]);
        io.emit('loveLetterChat message', "C'est au joueur " + tourActuel[5] + " de jouer.");
    });

    socket.on('piocher', (nomJoueur) => {
        pioche(getPlayerFromName(nomJoueur));
        io.emit('piocher', [DECK.length, [listeJoueurs, tourActuel]]);
    });

    socket.on('startNewGame', (nbjoueurs) => {
        newGame(nbjoueurs);
        NBJOUEURS = nbjoueurs;
        io.emit("startNewGame", [listeJoueurs, tourActuel]);
        io.emit('piocher', [DECK.length, listeJoueurs, tourActuel]);
        io.emit("loveLetterChat message", "La partie commence, c'est au tour de " + j0id);
    });

    socket.on('loveLetterChat message', (msg) => {
        io.emit('loveLetterChat message', socket.id + ": " + msg);
    });
});