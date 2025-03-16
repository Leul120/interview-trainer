package com.interviewTrainer.userService.config;

import com.interviewTrainer.userService.entity.User;
import com.interviewTrainer.userService.requests.UserRequest;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;

@Component
public class Patcher {

    public static void userPatcher(User existingUser, UserRequest incompleteUser) throws IllegalAccessException {
        Class<?> userClass = User.class;
        Field[] userFields = userClass.getDeclaredFields();

        for (Field field : userFields) {
            if (field.getName().equals("id")) { // Skip id field
                continue;
            }
            field.setAccessible(true);
            Object value = null;
            try {
                value = field.get(incompleteUser);
            } catch (IllegalArgumentException e) {
                // This happens when `UserRequest` doesn't have the field
                continue;
            }
            if (value != null) {
                field.set(existingUser, value);
            }
            field.setAccessible(false);
        }
    }

}
