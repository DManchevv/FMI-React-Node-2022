COPY products(name, category, manufacturer, price, description, summary, image, quantity, active) FROM stdin (format csv, delimiter ' ', header true);
abcd 2 1 100.000 abcd abcd 9 10 TRUE
abcd 1 1 100.000 abcd abcd 11 10 TRUE
abcd 1 2 100.000 abcd abcd 9 10 TRUE
abcd 2 2 100.000 abcd abcd 11 10 TRUE
...
\.

