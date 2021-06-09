clear all; clc;
% inputs that get entered to jamovi starts with "t_" 
%% 1. set up data input 
delimiterIn = ' ';

master = importdata('analyses_input_raw.csv', delimiterIn); master = cellstr(split(master, ','));
key = importdata('alphanum_recode.csv', delimiterIn); key = cellstr(split(key, ','));

t_sub_id = (201:320)'; n_sub = length(t_sub_id); 
t_gametype = repmat((1:2)',n_sub/2,1);
t_trainingset = repmat([1,1,2,2]',n_sub/4,1);
t_learnertype = str2double(master(2:n_sub+1,4)); % 1 = exemplar 2 = rule learner 3 = non learner 
practice = str2double(master(2:n_sub+1,5:52)); % practice data 1 = correct, 0 = incorrect 
t_practice_round = NaN(n_sub,6); t_practice_percent = NaN(n_sub,1);

for i = 1:n_sub
    for j = 0:5
        t_practice_round(i,j+1) = sum(practice(i,(8*j)+1:8*(j+1))); % round 1,2,3,4,5,6: sum 1-8, 9-16, 17-24, 25-32, 33-48 
    end
    t_practice_percent(i,1) = mean(practice(i,1:48));
end

%import all of the test data from the raw text file  
for i = 1:n_sub
    b = i + 200;
    filename = sprintf('data/%d.txt',b);
    a = importdata(filename);
    test_q_perf(i,:) = a.textdata(1:24,2)'; % true = correct, false = incorrect 
    test_q_input_1(i,:) = a.textdata(1:24,3)'; % input 1
    test_q_input_2(i,:) = a.textdata(1:24,4)'; % input 2
    test_q_correct_answer(i,:) = a.textdata(1:24,5)'; % correct answer
    test_q_subj_resp(i,:) = a.textdata(1:24,6)'; % participant's response 
    test_q_rt(i,:) = a.data(1:24,1)';
end
%% 2. recode data into values
test_q_correct_answer_recoded = NaN(n_sub,24); %answer keys recoded into numerical values 
test_q_subj_resp_recoded = NaN(n_sub,24); %participant response recoded into numerical values 
test_q_abs_error = NaN(n_sub,24);
test_q_score = NaN(n_sub,24);
% recode alphanumeric codes into actual numerical values 
for i = 1:n_sub
    for j = 1:24
        % recode correct answers 
        match_1 = strcmp(test_q_correct_answer{i,j},key);
        this_ind_1 = find(match_1);
        test_q_correct_answer_recoded(i,j) = this_ind_1 - 1; %because DD = 0 not 1
        
        % recode participants' responses 
        match_2 = strcmp(test_q_subj_resp{i,j},key);
        this_ind_2 = find(match_2); 
        test_q_subj_resp_recoded(i,j) = this_ind_2 - 1;
        
        % calculate performance accuracy
        % absolute error of participants' answers
        test_q_abs_error(i,j) = abs(test_q_correct_answer_recoded(i,j) - test_q_subj_resp_recoded(i,j));
       
        if strcmp(test_q_perf(i,j),'true') > 0
            test_q_score(i,j) = 1;
        else
            test_q_score(i,j) = 0;
        end
    end
end
%% 3. calculate correct/incorrect for trained vs. untrained items 
set1 = {'DM','DY'}; % set A 
set2 = {'DP','GD'}; % set B 

% identify which items were trained and which ones were untrained test
% items by their training set 
trained_q = NaN(n_sub,16); trained_q_abs_error = NaN(n_sub,16); t_trained_percent = NaN(n_sub,1); t_trained_abs_error_mean_unit = NaN(n_sub,1);
untrained_q = NaN(n_sub,16); untrained_q_abs_error = NaN(n_sub,16); t_untrained_percent = NaN(n_sub,1); t_untrained_abs_error_mean_unit = NaN(n_sub,1);
extrapolation_q = NaN(n_sub,8); extrapolation_q_abs_error = NaN(n_sub,8); t_extrapolation_percent = NaN(n_sub,1); t_extrapolatoin_abs_error_mean_unit = NaN(n_sub,1);
 
for i = 1:n_sub
    for j = 1:16
        if t_trainingset(i,1) == 1 % this participant was in set A 
            match = strcmp(test_q_input_1(i,j),set1);
            if sum(match) > 0  %if the input_1 is either DM or DY, it's a trained pair 
                trained_q(i,j) = test_q_score(i,j); 
                trained_q_abs_error(i,j) = test_q_abs_error(i,j);
            else %if the input_1 is neitehr DM nor DY, it's an untrained pair
                untrained_q(i,j) = test_q_score(i,j);
                untrained_q_abs_error(i,j) = test_q_abs_error(i,j);
            end
        else % this participant was in set B 
            match = strcmp(test_q_input_1(i,j),set2);
            if sum(match) > 0 %if the input is either DP or GD, it's a trained pair 
                trained_q(i,j) = test_q_score(i,j); 
                trained_q_abs_error(i,j) = test_q_abs_error(i,j);
            else
                untrained_q(i,j) = test_q_score(i,j);
                untrained_q_abs_error(i,j) = test_q_abs_error(i,j);
            end
        end
    end
    t_trained_percent(i,1) = nanmean(trained_q(i,1:16));
    t_trained_abs_error_mean_unit(i,1) = nanmean(trained_q_abs_error(i,1:16));
    t_untrained_percent(i,1) = nanmean(untrained_q(i,1:16));
    t_untrained_abs_error_mean_unit(i,1) = nanmean(untrained_q_abs_error(i,1:16));
end

for i = 1:n_sub
    for j = 1:8
        extrapolation_q(i,j) = test_q_score(i,16+j); % extrapolation items are test trials 17-24 
        extrapolation_q_abs_error(i,j) = test_q_abs_error(i,16+j);
        t_extrapolation_percent(i,1) = nanmean(extrapolation_q(i,1:8)); 
        t_extrapolatoin_abs_error_mean_unit(i,1) = nanmean(extrapolation_q_abs_error(i,1:8));
    end
end
%% 4. find performance for each problem type 
test_problem_type = nan(n_sub,24);
problem = importdata('problem.csv', delimiterIn); problem = cellstr(split(problem, ','));
problem_x_accuracy = nan(n_sub,24);
problem_x_error_units = nan(n_sub,24);

for i = 1:n_sub
    for j = 1:24
        input1_match = strcmp(test_q_input_1(i,j),problem(:,1));
        input2_match = strcmp(test_q_input_2(i,j),problem(:,2));
        problem_number = find(input1_match>0 & input2_match>0);
        test_problem_type(i,j) = problem_number;
        problem_x_accuracy(i,problem_number) = test_q_score(i,j); 
        problem_x_error_units(i,problem_number) = test_q_abs_error(i,j);
    end
end

%% 5. Only look at the "reverse" items (Q. Within untrained items, tease apart simple "reverse" pairs vs. real near transfer)

% calculate correct/incorrect for trained vs. untrained items 
set1 = {'DM','DY'}; % set A 
set2 = {'DP','GD'}; % set B 

% identify which items were trained and which ones were untrained test
% items by their training set 
trained_q = NaN(n_sub,16); trained_q_abs_error = NaN(n_sub,16); t_trained_percent = NaN(n_sub,1); t_trained_abs_error_mean_unit = NaN(n_sub,1);
untrained_q = NaN(n_sub,16); untrained_q_abs_error = NaN(n_sub,16); t_untrained_percent = NaN(n_sub,1); t_untrained_abs_error_mean_unit = NaN(n_sub,1);
extrapolation_q = NaN(n_sub,8); extrapolation_q_abs_error = NaN(n_sub,8); t_extrapolation_percent = NaN(n_sub,1); t_extrapolatoin_abs_error_mean_unit = NaN(n_sub,1);
 
for i = 1:n_sub
    for j = 1:16
        if t_trainingset(i,1) == 1 % this participant was in set A 
            match = strcmp(test_q_input_1(i,j),set1);
            if sum(match) > 0  %if the input_1 is either DM or DY, it's a trained pair 
                trained_q(i,j) = test_q_score(i,j); 
                trained_q_abs_error(i,j) = test_q_abs_error(i,j);
            else %if the input_1 is neitehr DM nor DY, it's an untrained pair
                untrained_q(i,j) = test_q_score(i,j);
                untrained_q_abs_error(i,j) = test_q_abs_error(i,j);
            end
        else % this participant was in set B 
            match = strcmp(test_q_input_1(i,j),set2);
            if sum(match) > 0 %if the input is either DP or GD, it's a trained pair 
                trained_q(i,j) = test_q_score(i,j); 
                trained_q_abs_error(i,j) = test_q_abs_error(i,j);
            else
                untrained_q(i,j) = test_q_score(i,j);
                untrained_q_abs_error(i,j) = test_q_abs_error(i,j);
            end
        end
    end
    t_trained_percent(i,1) = nanmean(trained_q(i,1:16));
    t_trained_abs_error_mean_unit(i,1) = nanmean(trained_q_abs_error(i,1:16));
    t_untrained_percent(i,1) = nanmean(untrained_q(i,1:16));
    t_untrained_abs_error_mean_unit(i,1) = nanmean(untrained_q_abs_error(i,1:16));
end

for i = 1:n_sub
    for j = 1:8
        extrapolation_q(i,j) = test_q_score(i,16+j); % extrapolation items are test trials 17-24 
        extrapolation_q_abs_error(i,j) = test_q_abs_error(i,16+j);
        t_extrapolation_percent(i,1) = nanmean(extrapolation_q(i,1:8)); 
        t_extrapolatoin_abs_error_mean_unit(i,1) = nanmean(extrapolation_q_abs_error(i,1:8));
    end
end

