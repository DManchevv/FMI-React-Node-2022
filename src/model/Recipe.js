export class Recipe {
    constructor(id, creator, name, summary, cookingTime, products, image, description, tags, creationDateTime, lastModificationDateTime) {
        this.id = id;
        this.creator = creator;
        this.name = name;
        this.summary = summary;
        this.cookingTime = cookingTime;
        this.products = products;
        this.image = image;
        this.description = description;
        this.tags = tags;
        this.creationDateTime = creationDateTime;
        this.lastModificationDateTime = lastModificationDateTime;
    }
}