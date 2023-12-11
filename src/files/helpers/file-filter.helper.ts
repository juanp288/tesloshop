export const fileFiter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  // file: {
  //     fieldname: 'file',
  //     originalname: 'Juan Pablo Victoria.jpg',
  //     encoding: '7bit',
  //     mimetype: 'image/jpeg'
  // }
  if (!file) return cb(new Error('File is empty'), false);

  if (validExtensions.includes(file.mimetype.split('/')[1]))
    return cb(null, true);

  cb(null, false);
};
