package com.interviewTrainer.userService.config;

import com.interviewTrainer.userService.entity.User;
import com.interviewTrainer.userService.requests.UserRequest;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;

@Component
public class Patcher {

    public static void userPatcher(User existingUser, UserRequest incompleteUser) throws  IllegalAccessException {
        Class<?> userClass= User.class;
        Field[] userFields= userClass.getDeclaredFields();
        for(Field field:userFields){
            field.setAccessible(true);
            if (field.getName().equals("id")) { // Skip id field
                continue;
            }
            Object value=field.get(incompleteUser);
            if (value!=null){
                field.set(existingUser,value);
            }
            field.setAccessible(false);
        }
    }
}
