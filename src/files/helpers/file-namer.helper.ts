import { v4 as generate } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {
  if (!file) return cb(new Error('File is empty'), false);

  const fileExt = file.mimetype.split('/')[1];
  const fileName = `${generate()}.${fileExt}`;

  cb(null, fileName);
};
