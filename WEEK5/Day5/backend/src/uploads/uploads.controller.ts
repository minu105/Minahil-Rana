import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/uploads')
export class UploadsController {
  @UseGuards(JwtAuthGuard)
  @Post('photos')
  @UseInterceptors(FilesInterceptor('photos'))
  uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    const paths = (files || []).map((f) => `/uploads/${f.filename}`);
    return { paths, count: paths.length };
  }
}
