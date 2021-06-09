clear all
clc

n_sub = 120; 
% question_score = [];%NaN(n_sub,24);
% question_input_1 = [];%NaN(n_sub,24);
% question_input_2 = [];%NaN(n_sub,24);
% question_correct_answer = [];%(n_sub,24);
% question_subj_resp = [];%NaN(n_sub,24);
% question_rt = [];%NaN(n_sub,24); 

for i = 1:n_sub
    b = i + 200;
    filename = sprintf('%d.txt',b);
    a = importdata(filename);
    question_score(i,:) = a.textdata(1:24,2)'; % true = correct, false = incorrect 
    question_input_1(i,:) = a.textdata(1:24,3)'; % input 1
    question_input_2(i,:) = a.textdata(1:24,4)'; % input 2
    question_correct_answer(i,:) = a.textdata(1:24,5)'; % correct answer
    question_subj_resp(i,:) = a.textdata(1:24,6)'; % participant's response 
    question_rt(i,:) = a.data(1:24,1)';
end