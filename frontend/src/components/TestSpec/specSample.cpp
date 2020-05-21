// Код теста

int sum(int, int);

TEST_CASE() {
    // Тест функции main
	nitori::main({
        // Ожидаемый код возврата
		.exitCode = 0,

		// Ожидаемые выходные данные
		.stdin = R"(
            Hello, world!
		)"_test
	});

    REQUIRE(sum(2, 3) == 5);
}