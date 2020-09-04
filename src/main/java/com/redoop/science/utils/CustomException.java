package com.redoop.science.utils;

/**
 * @Author: Alan
 * @Time: 2018/11/5 9:44
 * @Description:
 */
public class CustomException extends RuntimeException {

    private int code;
    private String msg;
    public CustomException() {
        super();
    }

    public CustomException(int code, String message) {
        super(message);
        this.setCode(code);
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }
}
