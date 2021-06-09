for i = 1:n_sub
    for j = 1:n_trial
        if input_data(1,j) > 80 && input_data(1,j) < 120 %for inputs outside of training range 
            interpolation_bilinear_tmp(i,j) = error_bilinear(i,j);
            interpolation_sin_tmp(i,j) = error_sin(i,j);
        else
            interpolation_bilinear_tmp(i,j) = NaN;
            interpolation_sin_tmp(i,j) = NaN;
        end
    end
    bb = interpolation_bilinear_tmp(i,:);
    ss = interpolation_sin_tmp(i,:);
    bb = b(~isnan(b)); %take out all the NaN's
    ss = s(~isnan(s));
    interpolation_error_bilinear(i,:) = bb; 
    interpolation_bilinear_MAE(i,1) = nanmean(interpolation_bilinear_tmp(i,:));
    interpolation_error_sin(i,:) = ss; 
    interpolation_sin_MAE(i,1) = nanmean(interpolation_sin_tmp(i,:));
end
