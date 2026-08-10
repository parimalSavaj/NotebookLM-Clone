export class ApiResponse<T> {
  public readonly statusCode: number;
  public readonly data: T;

  private constructor(statusCode: number, data: T) {
    this.statusCode = statusCode;
    this.data = data;
  }

  static success<T>(data: T, statusCode: number = 200): ApiResponse<T> {
    return new ApiResponse(statusCode, data);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      data: this.data,
    };
  }
}
