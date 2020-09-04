package com.redoop.science.handler;

import com.redoop.science.utils.CustomException;
import com.redoop.science.utils.Result;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @Author: Alan
 * @Time: 2018/11/5 9:47
 * @Description: 全局异常处理
 */
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    /**
     * 定义要捕获的异常 可以多个 @ExceptionHandler({})
     * @return 响应结果
     */
    /*@ExceptionHandler(CustomException.class)
    public Result customExceptionHandler(HttpServletRequest request, final Exception e, HttpServletResponse response) {
        response.setStatus(HttpStatus.BAD_REQUEST.value());
        CustomException exception = (CustomException) e;
        return new Result(exception.getCode(), exception.getMessage());
    }*/
    @ExceptionHandler(value = CustomException.class)
    public ModelAndView myErrorHandler(CustomException ex) {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("/error/401");
        modelAndView.addObject("code", ex.getCode());
        modelAndView.addObject("msg", ex.getMsg());
        return modelAndView;
    }

    /**
     * 捕获  RuntimeException 异常
     *
     * @param request  request
     * @param e        exception
     * @param response response
     * @return 响应结果
     */
    @ResponseBody
    @ExceptionHandler(RuntimeException.class)
    public Result runtimeExceptionHandler(HttpServletRequest request, final Exception e, HttpServletResponse response) {
        response.setStatus(HttpStatus.BAD_REQUEST.value());
        RuntimeException exception = (RuntimeException) e;
        return new Result(400, exception.getMessage());
    }

    /**
     * 通用的接口映射异常处理方
     */
    @ResponseBody
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
                                                             HttpStatus status, WebRequest request) {
        if (ex instanceof MethodArgumentNotValidException) {
            MethodArgumentNotValidException exception = (MethodArgumentNotValidException) ex;
            return new ResponseEntity<>(new Result(status.value(), exception.getBindingResult().getAllErrors().get(0).getDefaultMessage()), status);
        }
        if (ex instanceof MethodArgumentTypeMismatchException) {
            MethodArgumentTypeMismatchException exception = (MethodArgumentTypeMismatchException) ex;
            logger.error("参数转换失败，方法：" + exception.getParameter().getMethod().getName() + "，参数：" + exception.getName()
                    + ",信息：" + exception.getLocalizedMessage());
            return new ResponseEntity<>(new Result(status.value(), "参数转换失败"), status);
        }
        return new ResponseEntity<>(new Result(status.value(), "参数转换失败"), status);
    }
}
