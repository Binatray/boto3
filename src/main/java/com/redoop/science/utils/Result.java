
package com.redoop.science.utils;

import lombok.Data;

import java.io.Serializable;

/**
 * @Author: Alan
 * @Time: 2018/9/14 10:30
 * @Description:
 */
@Data
public class Result<T> implements Serializable {
    private int code;
    private String msg;
    private T content;

    public Result(ResultEnum resultEnum, T content) {
        this.code = resultEnum.getCode();
        this.msg = resultEnum.getMsg();
        this.content = content;
    }
    public Result(ResultEnum resultEnum) {
        this.code = resultEnum.getCode();
        this.msg = resultEnum.getMsg();
    }
    public Result(ResultEnum resultEnum,String msg, T content) {
        this.code = resultEnum.getCode();
        this.msg = msg;
        this.content = content;
    }
    public Result(Integer code,String msg) {
        this.code = getCode();
        this.msg = getMsg();
    }
}