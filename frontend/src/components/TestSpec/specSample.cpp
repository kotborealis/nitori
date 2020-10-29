// Код теста

// Декларация функции из тестируемого кода
int sum(int, int);
int sumAndPrint(int a, int b);
void sumAndPrintVoid(int a, int b);

TEST_CASE() {
    // Тест функции main
    // Неиспользуемые параметры можно пропускать,
    // но необходимо сохранять порядок параметров
	nitori::main({
	    // Аргументы
	    .args = {"input.txt", "output.txt"},

	    // Ожидаемый код возврата
        .exitCode = 0,

        // Файловая система на входе
        .fsin = {
            {"input.txt", "123qwe"},
        },

        // Файловая система на выходе
        .fsout = {
            {"output.txt", "123qwe"},
        },

	    // Ввод с клавиатуры (stdin)
	    .stdin = R"(
	        Stdin text!
	    )"_test,

		// Вывод на экран (stdout)
		.stdout = R"(
            Hello, world!
		)"_test,
	});

    // Вызов функции из тестируемого кода
    REQUIRE(sum(2, 3) == 5);

    // или
    {
        auto [stdout_str, return_value] = nitori::call(sum, 2, 3);
        REQUIRE(stdout_str == "");
        REQUIRE(return_value == 5);
    }
    {
        auto [stdout_str, return_value] = nitori::call(sumAndPrint, 2, 3);
        REQUIRE(stdout_str == "5");
        REQUIRE(return_value == 5);
    }
    {
        auto [stdout_str] = nitori::call(sumAndPrintVoid, 2, 3);
        REQUIRE(stdout_str == "5");
    }
}