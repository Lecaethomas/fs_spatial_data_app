#flask --app app run   
import os
from geojson import Feature, Point, FeatureCollection, Polygon
import psycopg2
from dotenv import load_dotenv
from flask import Flask, jsonify
import json 
from flask_cors import CORS

from sqlalchemy import create_engine, text
import shapely.wkt


load_dotenv()  # loads variables from .env file into environment
app = Flask(__name__)
CORS(app)

# Connexion details for PSYCHOPG
connection = psycopg2.connect(
    host="localhost",
    database="postgres",
    user="postgres",
    password="admin")

# Set up the database engine for SQLALCHEMY
engine = create_engine("postgresql://postgres:admin@localhost/postgres")


@app.route('/api/ccles_emissions/<string:etb_id>')
def create_ccles_emissions(etb_id):
    stmt = text("SELECT * FROM risques.irep_emissions WHERE identifiant = :etb_id")
    data = engine.execute(stmt, etb_id=etb_id)
    return jsonify([dict(row) for row in data])


@app.route('/api/geo_etb')
def create_geo_etb():
    # Execute the SQL query and retrieve the geometries as WKT strings
    rows = engine.execute(text("select st_astext(geom) geom , nom_etablissement, libelle_ape, libelle_eprtr, identifiant from risques.irep_etablissements_preprocessed_4326_filtered")).fetchall()
    # Convert the WKT strings to Shapely geometry objects
    geometry = None
    features = []
    for row in rows:
        geometry = shapely.wkt.loads(row[0])
        properties = {
            'nom_etablissement': row[1],
            'libelle_ape': row[2],
            'libelle_eprtr': row[3],
            'identifiant': row[4],
        }
        features.append(Feature(geometry=geometry, properties=properties))
    # Create a GeoJSON FeatureCollection object
    collection = FeatureCollection(features)

    
    # Return the list of GeoJSON objects as a JSON response
    return jsonify(collection)

