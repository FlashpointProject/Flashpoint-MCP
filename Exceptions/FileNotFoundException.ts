import { RuntimeException } from 'node-exceptions'

export class FileNotFoundException extends RuntimeException {
  static file (path: string) {
    const exception = new this(`The file ${path} doesn't exist`, 404)
    return exception
  }
}
