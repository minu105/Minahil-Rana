import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private model: Model<CategoryDocument>) {}

  async create(dto: CreateCategoryDto) {
    const created = new this.model(dto);
    return created.save();
  }

  async list() {
    return this.model.find().sort({ displayName: 1 }).exec();
  }
}
