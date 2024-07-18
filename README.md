Program pro ovládání [Robutka](https://github.com/RoboticsBrno/Robutek) funkcí radio. Jako ovladač slouží [ELKS](https://github.com/RoboticsBrno/RB3206-ELKS) s [tímto](https://github.com/Tom-353/ELKS-controller) programem.

Robutek čeká na přijetí radia začínající písmenem `C`, poté si zapamatuje toto zařízení jako jeho ovladač a nepřijímá příkazy od ostatních zařízení. Příkazy poté přijímá ve formátu `P<směr>,<zatáčení>,<servo>,<rychlost>` s čísly v rozsahu 0-1023.

Pokud nechcete při každém zapnutí připojovat svůj ovladač, tak jeho adresu dopište do řádku `var controller: string = "";`.