const sum_to_n_a = (n) => {
    return sum=n*(n+1)/2;
};

const sum_to_n_b = (n) => {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum
};

const sum_to_n_c = (n) => {
    let sum = 0;
    while (n > 0) {
        sum += n;
        n--;
    }
    return sum;
};

sum_to_n_a(10);
sum_to_n_b(10);
sum_to_n_c(10);