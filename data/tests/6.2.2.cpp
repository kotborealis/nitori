#include "testing.hpp"

void fill(int *matrix, int size);

TEST_CASE("6.2.2") {
    SECTION("Example 1") {
        HIJACK_STDOUT();
        HIJACK_STDIN(
            "3"
        );

        HIJACK_MAIN(0, 0);

        REQUIRE(
            hijack_stdout.str()
            ==
            "3 2 2\n"
            "1 3 2\n"
            "1 1 3\n"
        );
    }

    SECTION("Single element") {
        HIJACK_STDOUT();
        HIJACK_STDIN(
            "1"
        );

        HIJACK_MAIN(0, 0);

        REQUIRE(
            hijack_stdout.str()
            ==
            "3\n"
        );
    }

    SECTION("Function exists & writes to array") {
        int arr[1][1];
        fill((int*)arr, 1);
        REQUIRE(arr[0][0] == 3);
    }
}