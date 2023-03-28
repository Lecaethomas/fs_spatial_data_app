    //Set global variables
    //Set path to data

    //GLOBAL CONST
    // const comInfo = document.getElementById('com-info');

    // if (document.getElementById('com-info').innerHTML === "") {
    //   comInfo.textContent = 'Survolez une commune pour obtenir ses informations';
    // }


    mapboxgl.accessToken =
      'pk.eyJ1IjoidGxlY2FlIiwiYSI6ImNreHJqOGFwaTAzN3Ayd281dTBmb3VzYTYifQ.8fwOWabWWbcfcUxi1rIxAQ';

    fetch('http://127.0.0.1:5000/api/geo_etb', {
        method: 'GET',
      })
      .then(response => {
        console.log('RESPONSE', response)
        return response.json();
      })
      .then(data_from_fetched => {
        //  console.log('33333333333', data_from_fetched)
        let geodata = data_from_fetched
        //  console.log('4444444444', geodata)
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v10'
        });

        map.fitBounds([
          [-13, 40],
          [19, 51]
        ])


        // var comID = null;
        let comID = null;
        let polygonID = null;

        map.on('load', () => {

          map.addSource('etb', {
            type: 'geojson',
            // Use a URL for the value for the `data` property.
            data: geodata,
            'generateId': true
          });
          // map.addSource('com_click', {
          //   type: 'geojson',
          //   // Use a URL for the value for the `data` property.
          //   data: url_com,
          //   'generateId': true
          // });

          map.addLayer({
            'id': 'etb_points',
            'type': 'circle',
            'source': 'etb',
            'paint': {
              'circle-radius': 5,
              'circle-color': 'black',
              // 'line-opacity': [
              //   'case', ['boolean', ['feature-state', 'hover'], false],
              //   1,
              //   0.6
              // ]
            }
          });

          // map.addLayer({
          //   'id': 'coms-layer-fill',
          //   'type': 'fill',
          //   'source': 'com',
          //   'paint': {
          //     'fill-color': 'black',
          //     'fill-opacity': [
          //       'case', ['boolean', ['feature-state', 'hover'], false],
          //       0.3,
          //       0
          //     ]
          //   }
          // });

          // map.addLayer({
          //   'id': 'clicked-coms-layer-fill',
          //   'type': 'fill',
          //   'source': 'com_click',
          //   'paint': {
          //     'fill-color': 'yellow',
          //     'fill-opacity': [
          //       'case', ['boolean', ['feature-state', 'clicked'], false],
          //       0.4, // if selected true, paint in blue
          //       0
          //     ]
          //   }
          // });
          map.on('click', 'etb_points', (e) => {

            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`<strong>NOM : </strong> ${e.features[0].properties.nom_etablissement} <br> <strong>TYPE DE STRUCTURE : </strong>${e.features[0].properties.libelle_ape}
                    <br> <strong>DETAIL(S) :</strong> ${e.features[0].properties.libelle_eprtr} <br> <strong>ID :</strong> ${e.features[0].properties.identifiant}`)
              .addTo(map);
          });

          // Change the cursor to a pointer when
          // the mouse is over the states layer.
          map.on('mouseenter', 'etb_points', () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          // Change the cursor back to a pointer
          // when it leaves the states layer.
          map.on('mouseleave', 'etb_points', () => {
            map.getCanvas().style.cursor = '';
          });

          map.on('click', 'etb_points', (e) => {
            let etb_id = String(e.features[0].properties.identifiant)
            data_url = 'http://127.0.0.1:5000/api/ccles_emissions/' + etb_id
          
            // Get the table element
            var table = document.getElementById("emissionTable");
          
            // Get the number of rows in the table
            var rowCount = table.rows.length;
          
            // Delete the rows in the table (excluding the header row)
            for (var i = rowCount - 1; i > 0; i--) {
              table.deleteRow(i);
            }
            //Delete the content of div about the disponibility
            var divDispo = document.getElementById("dispoDiv");
            divDispo.innerHTML = "";
          
            fetch(data_url, {
              method: 'GET',
            })
            .then(response => {
              return response.json();
            })
            .then(data => {
              if (data.length < 2) {
                var divDispo = document.getElementById("dispoDiv");
                divDispo.innerHTML = "Pas de données d'émissions disponible pour cet établissement"
              } else {
                // Get the first row (the header row)
                var headerRow = table.rows[0];
          
                // Loop through the array of objects
                for (var i = 0; i < data.length; i++) {
                  // Get the current object
                  var obj = data[i];
          
                  // Create a new row element
                  var row = table.insertRow(headerRow.rowIndex + i + 1);
          
                  // Insert cells for each property of the object
                  var cell1 = row.insertCell();
                  cell1.innerHTML = obj.annee_emission;
                  var cell2 = row.insertCell();
                  cell2.innerHTML = obj.identifiant;
                  var cell3 = row.insertCell();
                  cell3.innerHTML = obj.milieu;
                  var cell4 = row.insertCell();
                  cell4.innerHTML = obj.nom_etablissement;
                  var cell5 = row.insertCell();
                  cell5.innerHTML = obj.polluant;
                  var cell6 = row.insertCell();
                  cell6.innerHTML = obj.quantite;
                  var cell7 = row.insertCell();
                  cell7.innerHTML = obj.unite;
                }
              }
            })
          })

        }); //END map.onload()
      }); //END FETCH




    ///*ANIMATION AU SURVOL

    // map.on('mousemove', 'coms-layer-fill', (event) => {
    //   map.getCanvas().style.cursor = 'pointer';
    //   // Set constants equal to the current feature's magnitude, location, and time
    //   const commune = event.features[0].properties.nom;
    //   const population = event.features[0].properties.population;
    //   const epci = event.features[0].properties.siren_epci;

    //   const comm = {
    //     name: commune,
    //     pop: population,
    //     epci: epci
    //   }

    //   const studentTemplate = templater `
    //     <div>La commune de <strong>${'name'}</strong> possède <strong>${'pop'}</strong> habitants et appartient à l'EPCI <strong>${'epci'} </strong>.</div>
    //     `;

    //   function templater(strings, ...keys) {
    //     return function (data) {
    //       let temp = strings.slice();
    //       keys.forEach((key, i) => {
    //         temp[i] = temp[i] + data[key];
    //       });
    //       return temp.join('');
    //     }
    //   };

    //   const myTemplate = studentTemplate(comm);
    //   comInfo.innerHTML = myTemplate

    //   // // Check whether features exist
    //   if (event.features.length === 0) return;

    //   // If comID for the hovered feature is not null,
    //   // use removeFeatureState to reset to the default behavior
    //   if (comID) {
    //     map.removeFeatureState({
    //       source: 'com',
    //       id: comID
    //     });
    //   }

    //   comID = event.features[0].id;

    //   // When the mouse moves over the coms-layer-fill layer, update the
    //   // feature state for the feature under the mouse

    //   map.setFeatureState({
    //     source: 'com',
    //     id: comID
    //   }, {
    //     hover: true
    //   });
    // }); // END map on mousemove
    // map.on('mouseleave', 'coms-layer-fill', () => {
    //   if (comID) {
    //     map.setFeatureState({
    //       source: 'com',
    //       id: comID
    //     }, {
    //       hover: false
    //     });
    //   }

    //   map.on('click', 'clicked-coms-layer-fill', function (e) {
    //     if (e.features.length > 0) {
    //       // if(typeof polygonID === 'number') { // Need to change this
    //       map.removeFeatureState({
    //         source: "com_click",
    //         id: polygonID
    //       });

    //       polygonID = e.features[0].id; // Get generated ID

    //       map.setFeatureState({
    //         source: 'com_click',
    //         id: polygonID,
    //       }, {
    //         clicked: true
    //       });
    //     }


    //   });


    //   comInfo.textContent = 'Survolez une commune pour obtenir ses informations';
    //   // Reset the cursor style
    //   map.getCanvas().style.cursor = '';
    //   comID = null;
    // }); //END map.ON mouseleave






    // d3.csv(url_hab).then(makeChart);

    // // Plot the data with Chart.js
    // function makeChart(countries) {
    //   map.on('click', (e) => {

    //     const features = map.queryRenderedFeatures(e.point);

    //     function comz(element) {
    //       return element.source = 'com';
    //     }
    //     clickedCom = features.filter(comz)
    //     clickedComInsee = clickedCom[0].properties.insee_com
    //     clickedComName = clickedCom[0].properties.nom


    //     console.log('33333', clickedComInsee)
    //     if (window.chart != null) {
    //       window.chart.destroy();
    //     }
    //     var country = countries.filter(function (d) {
    //       // console.log('########', clickedComInsee, d.id_geom)
    //       return d["id_geom"] == clickedComInsee;
    //     });

    //     var countryLabels = country.map(function (d) {
    //       return d.year.toString();
    //     });
    //     var ind_purs = country.map(function (d) {
    //       return d.Nombredelogementsautorisésindividuelspurs;
    //     });
    //     var ind_groupes = country.map(function (d) {
    //       return d.Nombredelogementsautorisésindividuelsgroupés;
    //     });
    //     var collectifs = country.map(function (d) {
    //       return d.Nombredelogementsautoriséscollectifs;
    //     });
    //     var residence = country.map(function (d) {
    //       return d.Nombredelogementsautorisésenrésidence;
    //     });
    //     window.chart = new Chart("myChart", {

    //       type: "bar",
    //       data: {
    //         labels: countryLabels,
    //         datasets: [{
    //             label: 'Logements individuels purs',
    //             data: ind_purs,
    //             backgroundColor: '#033E8Cbf'
    //           },
    //           {
    //             label: 'Logements individuels groupés',
    //             data: ind_groupes,
    //             backgroundColor: '#F24535bf'
    //           },
    //           {
    //             label: 'Logements collectifs',
    //             data: collectifs,
    //             backgroundColor: '#8C3030bf'
    //           },
    //           {
    //             label: 'Logements en résidence',
    //             data: residence,
    //             backgroundColor: '#30400Fbf'
    //           },

    //         ]
    //       },
    //       options: {
    //         plugins: {
    //           title: {
    //             display: true,
    //             text: 'Évolution du nombre d\'autorisation de PC concernant un logement pour la commune de ' + clickedComName,

    //             padding: {
    //               top: 2,
    //               bottom: 2
    //             },
    //             font:{
    //               style: 'normal'
    //             }
    //           }

    //         },
    //         responsive: true,
    //         scales: {
    //           x: {
    //             stacked: true,
    //             title:{
    //               display : true,
    //               text : 'Années'
    //             }
    //           },
    //           y: {
    //             stacked: true,
    //             title:{
    //               display : true,
    //               text : 'Nombre de logements'
    //             }
    //           }
    //         }
    //       }
    //     });
    //   })
    //   Chart.defaults.font.family = 'Rubik';
    //   Chart.defaults.font.style = 'normal';


    // }





    // // Load the dataset