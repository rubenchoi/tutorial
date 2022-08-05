# coding=utf-8

from faker import Faker
from faker.generator import random

from faker_vehicle import VehicleProvider
from datetime import datetime
from pymongo import MongoClient
import pymongo

import sys
import io

SKIP_DATA_NUM = 0
CREATE_MANY_NUM = 500000

def get_database():

    # Provide the mongodb atlas url to connect python to mongodb using pymongo
    CONNECTION_STRING = "mongodb://localhost:27017/lgeswa2022"
    #CONNECTION_STRING = "mongodb+srv://tireking1011:lge12345!!@cluster0.qacixkx.mongodb.net/test"
    # CONNECTION_STRING = "mongodb://10.58.28.228:27017/lgeswa2022"

    # Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
    client = MongoClient(CONNECTION_STRING)

    # Create the database for our example (we will use the same database throughout the tutorial
    return client['lgeswa2022']
    

items = []
i=0
cnt=0

# Get the database
dbname = get_database()
print(dbname)

collection_name = dbname["platenumbers"]
print(collection_name)


f = open('license_plate_recognition/OpenAPLR-3.1.1_Vs2022_2/faker/datafile.txt', encoding='utf-8')
line = None
while line != ' ':
	line = f.readline().replace("\n", "")
	if i==0:
		plate = line
		i+=1
	elif i==1:
		status = line
		i+=1
	elif i==2:
		registration = line
		i+=1
	elif i==3:
		ownerName = line
		i+=1
	elif i==4:
		ownerBirth = line
		i+=1
	elif i==5:
		ownerAddress = line
		i+=1
	elif i==6:
		ownerCity = line
		i+=1
	elif i==7:
		vehicleYear = line
		i+=1
	elif i==8:
		vehicleMaker = line
		i+=1
	elif i==9:
		vehicleModel = line
		i+=1
	elif i==10:
		if line.find('$') != -1:
			array = line.split('$')
			vehicleColor = array[0]
			i=1
			cnt+=1
			
			if cnt > SKIP_DATA_NUM: 
				item = {
				"plate": plate,
      	"status": status,
      	"registration": registration,
      	"ownerName": ownerName,
      	"ownerBirth": ownerBirth,
      	"ownerAddress": ownerAddress,
      	"ownerCity": ownerCity,
      	"vehicleYear": int(vehicleYear),
      	"vehicleMaker": vehicleMaker,
      	"vehicleModel": vehicleModel,
      	"vehicleColor": vehicleColor}
      	
				items.append(item)
				
			if len(items) == CREATE_MANY_NUM:
				print(cnt)
				collection_name.insert_many(items)
				items = []
				
			plate = array[1]
					
		else:
			vehicleColor = line
			i=0
			cnt+=1
			
			if cnt > SKIP_DATA_NUM: 
				item = {
				"plate": plate,
      	"status": status,
      	"registration": registration,
      	"ownerName": ownerName,
      	"ownerBirth": ownerBirth,
      	"ownerAddress": ownerAddress,
      	"ownerCity": ownerCity,
      	"vehicleYear": int(vehicleYear),
      	"vehicleMaker": vehicleMaker,
      	"vehicleModel": vehicleModel,
      	"vehicleColor": vehicleColor}
      	
				items.append(item)
				
			if len(items) == CREATE_MANY_NUM:
				print(cnt)
				collection_name.insert_many(items)
				items = []
                
            
  	
  	
  
	
f.close()
  
 


 


