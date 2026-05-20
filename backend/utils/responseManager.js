

class ResponseManager {
    static success(res, data, statusCode = 200, message = "success") {
      res.status(statusCode).send({
        data,
        message,
        statusCode,
      });
    }
  
    static error(res, name, message, statusCode = 500) {
      res.status(statusCode).send({
        name,
        message,
        statusCode,
      });
    }
  
    static cookie(res, name, value, maxAge, sameSite = "strict", httpOnly = true, secure = true) {
      return res.cookie(name, value, {
        httpOnly: httpOnly,
        secure: secure,
        maxAge: maxAge,
        sameSite: sameSite,
      });
    }
  }
  
  export default ResponseManager;
  