Agent:

You are following clients request depends on its user needs. You should ask clarification first? before any changes on the database or anything might affect there are already records on database. 

When updating new database add new migrations keep the 0000_init.sql do not change it anymore

In per task generate me seperate each plan file per task.

# Tasks:

# Task:  Integrate IMGBB-API

## Intent:
I want you to integrate img-bb api. but i want to keep the img_url on my records.
take note in  

I want you to make it seemless and less headache to upload and set image on the products. 

## plan: 
- generate a lib that integrate imgbb and env variables
- add modules in products, galleries and categories that it could upload to imgbb api and set it to the corresponding img_url
- add new table that tracks imgbb for tracking and displaying uploads. uploads table.
- add new update migration to add provider and upload_id for products, galleries and categories corresponding to image url but make it optional because image_url will still come from external url sources.

## Specs:
ReferenceAPI:
docs\PM\imgbb\imgbb-api.md
New Table:
- uploads: contains meta records of imgbb response including img url, delete img links and provider. incase ishift provider but highly focus on imgbb.

# Task: PreOrder Tags
## Intent
I want you to add toggle button on crud. that it appears on the product card that it was a preorder.


## Plan
- on admin products crud add toggle that it was pre-order
- add migration to add boolean for pre-order
- add bubble label on the card that was a pre-order


# Task: Add Order Form
## Intent
I do not need a very complex order system. I just i want a form similar to google form for ordering. Like fire and forget.

name, cart items (selected from products and order items and note), 

I want you to design if better to put carts but only using dexiedb for localized no need for user sign in. 

You may add cart modules that display carts and orders but localized dexiedb only

## Specs
Reference:
docs\PM\references\carts.md
Shop
Dexie:
- Bun add dexie 
- Support for Dexie React

Local Dexie Table
- Cart
- CartItem
- Order History
- CustomerMeta - used for registering customer name to be added on order

New Table:
- Order Table - customer name, order date
- Order Items - conntected to products and variants


## Plan
- In customer facing - in products and products detail add to card
- add to card modal would display - products, items and capable to choose variants
- then add to card or place order button
- there should be new module on customer facing - `carts`
- add new module order history both are localized
- carts and order history dont require customer sign-in localize only on there browser
- carts will display all cart products and there is multi select for delete 
- Carts support remove item from card or multi select remove
- check customer meta to see if name is set
- add a modal to set customer meta first and put there name
- Then proceed to order module.
- Where it insert there name
- Where they can see cart orders where they can remove items on that cart on order
- Then they see total price
- Then order Items

# Task: Add Variants
## Intent
I want you to add variants to the products optional.

there is possibility of.
the product has different variant but same pricing to the parent product
the product has variant but different pricing (which it need to display the price range to the products)

add new column to product that updates display product(nullable) this will cache the price range if variant existing it will make computation of price range when variant update.

Also to the previous task they should align to variants


# Task: Improve settings of image url
## Intent
instead of one whole input text area and seperate by enter.
they should be a expandable inputs of text field with paste icon
with add button to add more inputs text field.

this should still support data or existing records that are already inputed on textarea and seperate by enter.
