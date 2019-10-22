#include "testing.hpp"

int *getData();
size_t getSize();
size_t getCapacity();
void append(int);
void append(int*, size_t);
void insert(size_t, int);
void erase(size_t);
int indexOf(int);
void reserve(size_t);
void squeeze();
void clear();
void print();


TEST_CASE("vector") {
    SECTION("Print") {
        nitori::hijack_stdout();

        std::string test_reference;

        clear();
        for(size_t i = 0; i < 10; i++) {
            append(i);

            if(i == 0) test_reference += i;
            else test_reference += ", " + i;
        }

        REQUIRE(nitori::stdout() == test_reference);
    }
}