var JeuxDom = {
	namespace : function(ns) {
		"use strict";
		var parts = ns.split('.'), object = this, i, len;

		for (i = 0, len = parts.length; i < len; i += 1) {
			if (!object[parts[i]]) {
				object[parts[i]] = {};
			}
			object = object[parts[i]];
		}

		return object;
	}
};
/**
 *  fr : Configuration et variables
 *  en : Configuration and variables
 */

JeuxDom.namespace('Tptc');

JeuxDom.Tptc.config = {
	'rows' : 15, // fr : nombre de lignes de la grille  , en :  number of rows of the grid
	'cols' : 15, // fr : nombre de colonnes de la grille,    en : number of columns of the grid
	'area' : 225, // fr : aire de la grille carree, en : area of the square grid
	'cellSize' : 30, // fr : taille de chaque case, en : cell size
	'n0' : 0, // fr : valeur par defaut de n le rayon limite de l'algorithme de recherche,  en : default value of n the radius limit for the search algorithm 
	'p0' : {
		'x' : 0,
		'y' : 0
	}, // fr : p0 point d'origine  par defaut de la recherche , en : p0 default value of the search origin
	'player' : [ 'x', 1, 2 ],   // fr : aucun, joueur 1 et joueur 2,  en : none, player 1, player 2
	'blankType' : 'x',    // fr : valeur par defaut d'une case,   en : default value of a cell
	'cl_p1' : 'cl_p1', // fr : classe css du joueur 1, en : css class of player 1
	'cl_p2' : 'cl_p2', // fr :  classe css du joueur 2, en : css class of player 2
	'cl_search' : 'cl_search', // fr :  classe css du mode recherche, en : css class of search mode
	'cl_match_p1' : 'cl_match_p1', // fr : classe css des autres pions du joueur 1 detectes,  en :  css class of player 1 other detected pawns
	'cl_match_p2' : 'cl_match_p2', // fr : classe css des autres pions du joueur 2 detectes,  en :  css class of player 2 other detected pawns
	'cl_opponent' : 'cl_opponent', // fr : classe css representant les menaces (adversaire), en : css class representing threats (opponent)
	'nbMoves' : 170, // fr : nombre de coups a generer , en : number of moves to generate
	'winMove' : 5,  // fr : nombre pions a aligner pour gagner, en : number of pawns to align in order to win
	'modules' : {}  // fr : objet stockant les references aux modules de l'application,   en :  object literal to store modules references
};
JeuxDom.Tptc.board = [];

/**
 * @project JeuxDom Ti point Ti croix
 * @namespace JeuxDom.Tptc.Utilitaires
 * @author Alexandre ELISE
 * @version 0.0.7
 * @link http://www.internet-planete.com
 */
JeuxDom.namespace('Tptc.Utilitaires');

JeuxDom.Tptc.Utilitaires = (function(jq, JD) {
	"use strict";
	var tptc;

	tptc = JD.Tptc;

	return {
		// fr : convertir coordonnees d'un point en id de case
		// en : convert point coordinates into cell id
		coordsToCid : function(x, y) {
			var cid = 0, m = tptc.config.rows;
			cid = Math.floor(m * y + x);
			return cid;
		},
		// fr : convertir id de case en coordonnees de point
		// en : convert cell id into point coordinates
		cidToCoords : function(cid) {
			var x = 0, y = 0, m = tptc.config.rows;
			y = Math.floor(cid / m);
			x = Math.floor(cid % m);
			return {
				'x' : x,
				'y' : y
			};
		},
		// fr : determiner si un point est hors de la zone de jeu
		// en : check if a point is in game zone
		hors_limites : function(point) {
			var x, y, cid, c = tptc.config.cols, r = tptc.config.rows;
			x = point.x;
			y = point.y;
			if (x < 0 || x > (c - 1) || y < 0 || y > (r - 1)) {
				return 'x';
			}
			cid = this.coordsToCid(x, y);
			return cid;
		},
		// fr : filtrer les erreurs
		// en : filter out errors
		filter : function(data) {
			var result = {
				'haut_gch' : '',
				'haut_drt' : '',
				'bas_drt' : '',
				'bas_gch' : '',
				'ht' : '',
				'bs' : '',
				'drt' : '',
				'gch' : ''
			};
			result.ht = this.hors_limites(data.ht);
			result.bs = this.hors_limites(data.bs);
			result.gch = this.hors_limites(data.gch);
			result.drt = this.hors_limites(data.drt);
			result.haut_gch = this.hors_limites(data.haut_gch);
			result.bas_drt = this.hors_limites(data.bas_drt);
			result.haut_drt = this.hors_limites(data.haut_drt);
			result.bas_gch = this.hors_limites(data.bas_gch);

			return result;
		},
		// fr : initialiser les cases
		// en : cells init
		init_board : function() {
			var r = 0, c = 0, blankType = tptc.config.blankType, rows = tptc.config.rows, cols = tptc.config.cols;
			for (r = 0; r < rows; r += 1) {
				tptc.board[r] = [];
				// fr : creer un nouveau tableau par ligne
				// en : create a new array per row
				for (c = 0; c < cols; c += 1) {
					tptc.board[r][c] = blankType;
				}
			}
		},
		// fr : recuperer etat case donnee
		// en : get a given cell state
		get_board : function(point) {
			return tptc.board[point.y][point.x];
		},
		// fr : definir etat case donnee
		// en : set a given cell state
		set_board : function(point, valeur) {
			tptc.board[point.y][point.x] = valeur;
		}
	};
}(jQuery, JeuxDom));

/**
 * @project JeuxDom Ti point Ti croix
 * @namespace JeuxDom.Tptc.Affichage
 * @author Alexandre ELISE
 * @version 0.0.7
 * @link http://www.internet-planete.com
 */
JeuxDom.namespace('Tptc.Affichage');

JeuxDom.Tptc.Affichage = (function(jq, JD) {
	"use strict";
	var tptc, utilitaires;

	tptc = JD.Tptc;
	utilitaires = JD.Tptc.Utilitaires;

	return {

		// fr : generer une repartition "aleatoire" de coups des joueurs
		// en : generate "random" player moves distibution
		randomize_moves : function(m) {
			var idxCoups = 0, nbCoups = m || Math.floor(tptc.config.area / 2), tour, initArray = [], randArray = [], point, cid = 0, r = 0, c = 0, k = 0, area = tptc.config.area, rows = tptc.config.rows, cols = tptc.config.cols;
			initArray = _.range(0, area);
			randArray = _.shuffle(initArray); // fr : Fisher-Yates shuffle utilise dans underscore.js,   en :  Fisher-Yates shuffle used in underscore.js

			for (idxCoups = 0; idxCoups < nbCoups; idxCoups += 1) {
				cid = randArray[idxCoups];
				point = utilitaires.cidToCoords(cid);
				r = point.y;
				c = point.x;

				if ((idxCoups % 2) === 0) {
					tptc.board[r][c] = tptc.config.player[1];
					jq('#cell-' + cid).addClass(tptc.config.cl_p1);
					jq('#cell-' + cid).text('1');
				} else {
					tptc.board[r][c] = tptc.config.player[2];
					jq('#cell-' + cid).addClass(tptc.config.cl_p2);
					jq('#cell-' + cid).text('2');
				}
			}
		},
		render_moves : function() {
			var cid = 0, point, k = 0, area = 0, rows = tptc.config.rows, cols = tptc.config.cols;

			area = rows * cols;

			for (cid = 0; cid < area; cid += 1) {
				point = utilitaires.cidToCoords(cid);

				if (utilitaires.get_board(point) === tptc.config.player[1]) {
					jq('#cell-' + cid).addClass(tptc.config.cl_p1);
					jq('#cell-' + cid).text('1');
				} else if (utilitaires.get_board(point) === tptc.config.player[2]) {
					jq('#cell-' + cid).addClass(tptc.config.cl_p2);
					jq('#cell-' + cid).text('2');
				} else {
					jq('#cell-' + cid).addClass('cl_cell');
					jq('#cell-' + cid).text('');
				}
			}
		},
		// fr : generer grille carree
		// en : generate square grid
		generate_grid : function() {
			var output = '<div class="cl_grid">', row, col, szCell = tptc.config.cellSize, rows = tptc.config.rows, cols = tptc.config.cols, actualSize = (szCell * cols), v = 0;

			for (row = 0; row < actualSize; row += szCell) {
				for (col = 0; col < actualSize; col += szCell) {
					output += '<span id="cell-' + v
							+ '" class="cl_cell cl_float_left">&nbsp;</span>';
					v += 1;
				}

			}
			output += '</div>';
			return output;
		},
		// fr : afficher les resultats
		// en : display results
		display : function(data) {
			var divRes = jq('#div-board'), i = 0, szData = data.length, showRes = data
					|| 'Pas de donnees pour le moment.', calcWidth, calcHeight;
			 // fr : largeur utile
			// en : actual width
			calcWidth = Math.floor(tptc.config.cols * tptc.config.cellSize);

			// fr : hauteur utile
			// en : actual height
			calcHeight = Math.floor(tptc.config.rows * tptc.config.cellSize); 
			

			divRes.html(showRes).css({
				'margin' : '0 auto',
				'width' : calcWidth,
				'height' : calcHeight
			});
		}
	};
}(jQuery, JeuxDom));




/**
 * @project JeuxDom Ti point Ti croix
 * @namespace JeuxDom.Tptc.Moteur.Detection
 * @author Alexandre ELISE
 * @version 0.0.6
 * @link http://www.internet-planete.com 
 */
JeuxDom.namespace('Tptc.Moteur.Detection');

JeuxDom.Tptc.Moteur.Detection = (function (jq, JD) {
    var tptc, utilitaires;
    
    tptc = JD.Tptc;
    utilitaires = JD.Tptc.Utilitaires;
    
    return {
    // fr : gauche
    // en : left
    gauche : function (n, p) {
        n = n || tptc.config.n0;
        p = p || tptc.config.p0;
        p.x -= n;
        return p;
    },
    // fr : droite
    // en : right
    droite : function (n, p) {
        n = n || tptc.config.n0;
        p = p || tptc.config.p0;
        p.x += n;
        return p;
    },
    // fr : haut
    // en : top
    haut : function (n, p) {
        var r = tptc.config.rows;
        n = n || tptc.config.n0;
        p = p || tptc.config.p0;
        p.y -= n;       
        return p;
    },
    // fr : bas
    // en : bottom
    bas : function (n, p) {
        var r = tptc.config.rows;
        n = n || tptc.config.n0;
        p = p || tptc.config.p0;
        p.y += n;
        return p;
    },
    // fr : haut droite
    // en : top right
    haut_droite : function (n, p) {
        var c = tptc.config.cols;
        n = n || tptc.config.n0;
        p = p || tptc.config.p0;
        p.x += n;
        p.y -= n;
        return p;
    },
    // fr : bas droite
    // en : bottom right
    bas_droite : function (n, p) {
        var c = tptc.config.cols;
        n = n || tptc.config.n0;
        p = p || tptc.config.p0;
        p.x += n;
        p.y += n;
        return p;
    },
    // fr : haut gauche
    // en : top left
    haut_gauche : function (n, p) {
        var c = tptc.config.cols;
        n = n || tptc.config.n0;
        p = p || tptc.config.p0;
        p.x -= n;
        p.y -= n;
        return p;
    },
    // fr : bas gauche
    // en : bottom left
    bas_gauche : function (n, p) {
        var c = tptc.config.cols;
        n = n || tptc.config.n0;
        p = p || tptc.config.p0;
        p.x -= n;
        p.y += n;
        return p;
    },
  
    // fr : determiner si le coup joue est un coup gagnant
    // en : check if the current move is a winning move
    est_coup_gagnant : function (nbAlignes) {
        var nbAlignesJoueur1 = 0, nbAlignesJoueur2 = 0;
        nbAlignesJoueur1 = Math.max((nbAlignes[1].ht + nbAlignes[1].bs + 1), (nbAlignes[1].gch + nbAlignes[1].drt + 1), (nbAlignes[1].haut_gch + nbAlignes[1].bas_drt + 1), (nbAlignes[1].haut_drt + nbAlignes[1].bas_gch + 1));
        nbAlignesJoueur2 = Math.max((nbAlignes[2].ht + nbAlignes[2].bs + 1), (nbAlignes[2].gch + nbAlignes[2].drt + 1), (nbAlignes[2].haut_gch + nbAlignes[2].bas_drt + 1), (nbAlignes[2].haut_drt + nbAlignes[2].bas_gch + 1));
        
        if (nbAlignesJoueur1 >= tptc.config.winMove) {
            console.info('fr : Le joueur 1 remporte la partie.');
            console.info('en : Player 1 wins.');
            alert('fr : Le joueur 1 remporte la partie! \n en : Player 1 wins!');
           
            // fr : recommencer
            // en : restart
           if (confirm('Recommencer? / Restart?')) {
        	   document.location.reload();
           } else {
        	   return false;
           }
        }
        if (nbAlignesJoueur2 >= tptc.config.winMove) {
            console.info('fr : Le joueur 2 remporte la partie.');
            console.info('en : Player 2 wins.');
            alert('fr : Le joueur 2 remporte la partie! \n en : Player 2 wins!');
         
            // fr : recommencer
            // en : restart
            if (confirm('Recommencer? / Restart?')) {
         	   document.location.reload();
            } else {
         	   return false;
            }
        }
    }  
};
}(jQuery, JeuxDom));

/**
 * @project JeuxDom Ti point Ti croix 
 * @namespace JeuxDom.Tptc.Moteur.Recherche
 * @author Alexandre ELISE
 * @version 0.0.6
 * @link http://www.internet-planete.com 
 */
JeuxDom.namespace('Tptc.Moteur.Recherche');

JeuxDom.Tptc.Moteur.Recherche = (function (jq, JD) {
    var tptc, utilitaires, detection;
    
    tptc = JD.Tptc;
    utilitaires = JD.Tptc.Utilitaires;
    detection = JD.Tptc.Moteur.Detection;
    
    return {
    
        // fr : chercher autour du point k (la case cliquee : recherche dans 8 directions --> O.C.H.O le nom de l'algorithme)
    	// en : search around k (the clicked cell : 8-way search  --> O.C.H.O the name of the algorithm)
        recherche : function (k) {
            var side = tptc.config.rows, m = 0, p1, p2, p3, p4, p5, p6, p7, p8, n = 1, res, 
                    data = {'ht' : 'x', 'bs' : 'x', 'gch' : 'x', 'drt' : 'x', 'haut_drt' : 'x', 'bas_drt' : 'x', 'haut_gch' : 'x', 'bas_gch' : 'x'},
                    pHaut, pBas, pGauche, pDroite, pHautGauche, pBasDroite, pHautDroite, pBasGauche, 
                    estJoueur1 = false, estJoueur2 = false,
                    nbAlignes = ['x', 
                    {'ht' : 0, 'bs' : 0, 'gch' : 0, 'drt' : 0, 'haut_gch' : 0, 'bas_drt' : 0, 'haut_drt' : 0, 'bas_gch' : 0}, 
                    {'ht' : 0, 'bs' : 0, 'gch' : 0, 'drt' : 0, 'haut_gch' : 0, 'bas_drt' : 0, 'haut_drt' : 0, 'bas_gch' : 0}];
            
            jq('#cell-' + k).addClass(tptc.config.cl_search);      
            p1 = utilitaires.cidToCoords(k);
            p2 = utilitaires.cidToCoords(k);
            p3 = utilitaires.cidToCoords(k);
            p4 = utilitaires.cidToCoords(k);
            p5 = utilitaires.cidToCoords(k);
            p6 = utilitaires.cidToCoords(k);
            p7 = utilitaires.cidToCoords(k);
            p8 = utilitaires.cidToCoords(k);
            
            // fr : verification joueur de la case actuelle
            // en : verify current cell player info
            if (utilitaires.get_board(p1) === tptc.config.player[1]) {
                estJoueur1 = true;
            } else if (utilitaires.get_board(p1) === tptc.config.player[2]) {
                estJoueur2 = true;
            } else {
                estJoueur1 = false;
                estJoueur2 = false;
            }       
            
            // fr : "chercher" dans toutes les directions "valides"
            // en : "search" in any "valid" directions
            // en haut
            for (m = 0; m < side; m += 1) {
                      data.ht = detection.haut(n, p1);    
                      // fr : filtrer les mauvaises donnees et resultats incorrects
                      // en : filter out all bad values or incorrect results
                      res = utilitaires.filter(data);         
               if (typeof res.ht === 'number') {
                    pHaut = utilitaires.cidToCoords(res.ht);
                    if (estJoueur1) {
                        if (utilitaires.get_board(pHaut) === tptc.config.player[1]) {
                            jq('#cell-' + res.ht).addClass(tptc.config.cl_match_p1);
                            nbAlignes[1].ht += 1;
                        } else {
                            if (utilitaires.get_board(pHaut)  === tptc.config.player[2]) {
                                jq('#cell-' + res.ht).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else if (estJoueur2) {
                        if (utilitaires.get_board(pHaut)  === tptc.config.player[2]) {
                            jq('#cell-' + res.ht).addClass(tptc.config.cl_match_p2);
                            nbAlignes[2].ht += 1;
                        } else {
                            if (utilitaires.get_board(pHaut) === tptc.config.player[1]) {
                                jq('#cell-' + res.ht).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else {
                        jq('#cell-' + res.ht).addClass(tptc.config.cl_search);
                   }
                }
             }
             // en bas
             for (m = 0; m < side; m += 1) {
                data.bs = detection.bas(n, p2);
                res = utilitaires.filter(data);     // filtrer les mauvaises donnees et resultats incorrects   
                if (typeof res.bs === 'number') {
                    pBas = utilitaires.cidToCoords(res.bs);
                    if (estJoueur1) {
                        if (utilitaires.get_board(pBas) === tptc.config.player[1]) {
                            jq('#cell-' + res.bs).addClass(tptc.config.cl_match_p1);
                            nbAlignes[1].bs += 1;
                        } else {
                            if (utilitaires.get_board(pBas)  === tptc.config.player[2]) {
                                jq('#cell-' + res.bs).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else if (estJoueur2) {
                        if (utilitaires.get_board(pBas)  === tptc.config.player[2]) {
                            jq('#cell-' + res.bs).addClass(tptc.config.cl_match_p2);
                            nbAlignes[2].bs += 1;
                        } else {
                            if (utilitaires.get_board(pBas) === tptc.config.player[1]) {
                                jq('#cell-' + res.bs).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else {
                        jq('#cell-' + res.bs).addClass(tptc.config.cl_search);
                   }            
                }
             }
             // a gauche
             for (m = 0; m < side; m += 1) {
                data.gch = detection.gauche(n, p3);
                res = utilitaires.filter(data); 
                if (typeof res.gch === 'number') {
                   pGauche = utilitaires.cidToCoords(res.gch);
                    if (estJoueur1) {
                        if (utilitaires.get_board(pGauche) === tptc.config.player[1]) {
                            jq('#cell-' + res.gch).addClass(tptc.config.cl_match_p1);
                            nbAlignes[1].gch += 1;
                        } else {
                            if (utilitaires.get_board(pGauche)  === tptc.config.player[2]) {
                                jq('#cell-' + res.gch).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else if (estJoueur2) {
                        if (utilitaires.get_board(pGauche)  === tptc.config.player[2]) {
                            jq('#cell-' + res.gch).addClass(tptc.config.cl_match_p2);
                            nbAlignes[2].gch += 1;
                        } else {
                            if (utilitaires.get_board(pGauche) === tptc.config.player[1]) {
                                jq('#cell-' + res.gch).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else {
                        jq('#cell-' + res.gch).addClass(tptc.config.cl_search);
                   }            
                }        
             }          
             // a droite
             for (m = 0; m < side; m += 1) {         
                data.drt = detection.droite(n, p4);
                res = utilitaires.filter(data);
                if (typeof res.drt === 'number') {
                    pDroite = utilitaires.cidToCoords(res.drt);
                    if (estJoueur1) {
                        if (utilitaires.get_board(pDroite) === tptc.config.player[1]) {
                            jq('#cell-' + res.drt).addClass(tptc.config.cl_match_p1);
                            nbAlignes[1].drt += 1;
                        } else {
                            if (utilitaires.get_board(pDroite)  === tptc.config.player[2]) {
                                jq('#cell-' + res.drt).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else if (estJoueur2) {
                        if (utilitaires.get_board(pDroite)  === tptc.config.player[2]) {
                            jq('#cell-' + res.drt).addClass(tptc.config.cl_match_p2);
                            nbAlignes[2].drt += 1;
                        } else {
                            if (utilitaires.get_board(pDroite) === tptc.config.player[1]) {
                                jq('#cell-' + res.drt).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                       }
                   } else {
                        jq('#cell-' + res.drt).addClass(tptc.config.cl_search);
                   }
                }
              }
             // en haut a droite
             for (m = 0; m < side; m += 1) {
               data.haut_drt = detection.haut_droite(n, p5);
               res = utilitaires.filter(data);
               if (typeof res.haut_drt === 'number') {
                    pHautDroite = utilitaires.cidToCoords(res.haut_drt);
                    if (estJoueur1) {
                        if (utilitaires.get_board(pHautDroite) === tptc.config.player[1]) {
                            jq('#cell-' + res.haut_drt).addClass(tptc.config.cl_match_p1);
                            nbAlignes[1].haut_drt += 1;
                        } else {
                            if (utilitaires.get_board(pHautDroite)  === tptc.config.player[2]) {
                                jq('#cell-' + res.haut_drt).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else if (estJoueur2) {
                        if (utilitaires.get_board(pHautDroite)  === tptc.config.player[2]) {
                            jq('#cell-' + res.haut_drt).addClass(tptc.config.cl_match_p2);
                            nbAlignes[2].haut_drt += 1;
                        } else {
                            if (utilitaires.get_board(pHautDroite) === tptc.config.player[1]) {
                                jq('#cell-' + res.haut_drt).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }                   
                   } else {
                        jq('#cell-' + res.haut_drt).addClass(tptc.config.cl_search);
                   }
                }
              }
              
              // en bas a gauche
              for (m = 0; m < side; m += 1) {  
               data.bas_gch = detection.bas_gauche(n, p6);
               res = utilitaires.filter(data);
               if (typeof res.bas_gch === 'number') {
                    pBasGauche = utilitaires.cidToCoords(res.bas_gch);
                    if (estJoueur1) {
                        if (utilitaires.get_board(pBasGauche) === tptc.config.player[1]) {
                            jq('#cell-' + res.bas_gch).addClass(tptc.config.cl_match_p1);
                            nbAlignes[1].bas_gch += 1;
                        } else {
                            if (utilitaires.get_board(pBasGauche)  === tptc.config.player[2]) {
                                jq('#cell-' + res.bas_gch).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }                   
                   } else if (estJoueur2) {
                        if (utilitaires.get_board(pBasGauche)  === tptc.config.player[2]) {
                            jq('#cell-' + res.bas_gch).addClass(tptc.config.cl_match_p2);
                            nbAlignes[2].bas_gch += 1;
                        } else {
                            if (utilitaires.get_board(pBasGauche) === tptc.config.player[1]) {
                                jq('#cell-' + res.bas_gch).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else {
                        jq('#cell-' + res.bas_gch).addClass(tptc.config.cl_search);
                   }
                }
              }
              
              // en haut a gauche
              for (m = 0; m < side; m += 1) { 
               data.haut_gch = detection.haut_gauche(n, p7);
               res = utilitaires.filter(data);
               if (typeof res.haut_gch === 'number') {
                   pHautGauche = utilitaires.cidToCoords(res.haut_gch);
                    if (estJoueur1) {
                        if (utilitaires.get_board(pHautGauche) === tptc.config.player[1]) {
                            jq('#cell-' + res.haut_gch).addClass(tptc.config.cl_match_p1);
                            nbAlignes[1].haut_gch += 1;
                        } else {
                            if (utilitaires.get_board(pHautGauche)  === tptc.config.player[2]) {
                                 jq('#cell-' + res.haut_gch).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }                  
                   } else if (estJoueur2) {
                        if (utilitaires.get_board(pHautGauche)  === tptc.config.player[2]) {
                            jq('#cell-' + res.haut_gch).addClass(tptc.config.cl_match_p2);
                            nbAlignes[2].haut_gch += 1;
                        } else {
                            if (utilitaires.get_board(pHautGauche) === tptc.config.player[1]) {
                                jq('#cell-' + res.haut_gch).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }
                   } else {
                        jq('#cell-' + res.haut_gch).addClass(tptc.config.cl_search);
                   }
                }
              }
              
              // en bas a droite
              for (m = 0; m < side; m += 1) {  
               data.bas_drt = detection.bas_droite(n, p8);
               res = utilitaires.filter(data);
               if (typeof res.bas_drt === 'number') {
                    pBasDroite = utilitaires.cidToCoords(res.bas_drt);
                    if (estJoueur1) {
                        if (utilitaires.get_board(pBasDroite) === tptc.config.player[1]) {
                            jq('#cell-' + res.bas_drt).addClass(tptc.config.cl_match_p1);
                            nbAlignes[1].bas_drt += 1;
                        } else {
                            if (utilitaires.get_board(pBasDroite)  === tptc.config.player[2]) {
                                jq('#cell-' + res.bas_drt).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }                
                   } else if (estJoueur2) {
                        if (utilitaires.get_board(pBasDroite)  === tptc.config.player[2]) {
                            jq('#cell-' + res.bas_drt).addClass(tptc.config.cl_match_p2);
                            nbAlignes[2].bas_drt += 1;
                        } else {
                            if (utilitaires.get_board(pBasDroite) === tptc.config.player[1]) {
                                jq('#cell-' + res.bas_drt).addClass(tptc.config.cl_opponent);
                                break;
                            }
                            break;
                        }                   
                   } else {
                        jq('#cell-' + res.bas_drt).addClass(tptc.config.cl_search);
                   }
              }
            }
            
           detection.est_coup_gagnant(nbAlignes);
            
        }
    };
}(jQuery, JeuxDom));


/**
 * @project JeuxDom Ti point Ti croix
 * @namespace JeuxDom.Tptc.Evenements
 * @author Alexandre ELISE
 * @version 0.0.7
 * @link http://www.internet-planete.com
 */
JeuxDom.namespace('Tptc.Evenements');

JeuxDom.Tptc.Evenements = (function(jq, JD) {
	"use strict";
	var tptc, rech, utilitaires, affichage;
	tptc = JD.Tptc;
	rech = JD.Tptc.Moteur.Recherche;
	utilitaires = JD.Tptc.Utilitaires;
	affichage = JD.Tptc.Affichage;

	function cell_handler_up(event) {
		jq('.' + tptc.config.cl_search).removeClass(tptc.config.cl_search);
		jq('.' + tptc.config.cl_opponent).removeClass(tptc.config.cl_opponent);
		jq('.' + tptc.config.cl_match_p1).removeClass(tptc.config.cl_match_p1);
		jq('.' + tptc.config.cl_match_p2).removeClass(tptc.config.cl_match_p2);
		affichage.render_moves();
		return false;
	}

	function cell_handler_down(event) {
		var el = event.target, strId, k, r = 0, c = 0, point;
		strId = jq(el).attr('id');
		strId = strId.substring(5);
		k = parseInt(strId, 10);

		// fr : chercher autour du point k (la case cliquee)
		// en : search around k (clicked cell)
		rech.recherche(k); 

		jq(el).on('mouseup', cell_handler_up);
		return false;
	}
	// fr : gestion des evenements
	// en : event handling
	return {
		evt_handler : function() {
			jq('#div-board').on('mousedown', 'span.cl_cell',
					cell_handler_down);
		},
		evt_off : function() {
			jq('#div-board').off('mousedown', 'span.cl_cell',
					cell_handler_down);
		}
	};
}(jQuery, JeuxDom));

/**
 *  fr   : Fonction principale permettant de lancer l'application
 *  en : Application entry point 
 */
JeuxDom.namespace('Tptc.Application');

JeuxDom.Tptc.Application = (function(JD) {
	"use strict";
	var tptc, utilitaires, affichage, detection, rech, evts;

	tptc = JD.Tptc;
	utilitaires = JD.Tptc.Utilitaires;
	affichage = JD.Tptc.Affichage;
	detection = JD.Tptc.Moteur.Detection;
	rech = JD.Tptc.Moteur.Recherche;
	evts = JD.Tptc.Evenements;

	function run() {
		var showGrid;

		// enregistrer les references aux modules utiles
		tptc.config.modules = {
			"utilitaires" : utilitaires,
			"affichage" : affichage,
			"detection" : detection,
			"rech" : rech,
			"evts" : evts
		};

		// fr : Afficher la grille avant tout 
        // en : Display grid before anything else
       showGrid = affichage.generate_grid(); 
		affichage.display(showGrid);
		
		
		// fr : Initialiser la matrice des coups (coups aleatoires de 2 joueurs à tour de role)
        // en : Init pseudo random moves matrix (random player moves for a 2 player turn based game)
        utilitaires.init_board(); 
		
        // fr : generer une repartition "aleatoire" de coups des joueurs
		// en : generate "random" player moves distibution
		affichage.randomize_moves(tptc.config.nbMoves);  
        
        // fr : pour les tests du moteur (affichage)
        // en : for engine testing (display)
        affichage.render_moves(); 

        // fr : Activer la gestion des evenements lies a l'utilisateur
        // en : Enable event handlers for user interaction
		evts.evt_handler();
	}

	  // fr : lancer l'application
    // en : start application
	run();
}(JeuxDom));