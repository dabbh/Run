#include <iostream>
#include <string>
#include <vector>

int main() {
	std::cout << "Hello from C++!" << std::endl;
	std::cout << "Testing C++ compilation and execution." << std::endl;

	// Vector operations
	std::vector<int> numbers = {1, 2, 3, 4, 5};
	int sum = 0;
	for (int num : numbers) {
		sum += num;
	}
	std::cout << "Sum of vector: " << sum << std::endl;

	// String operations
	std::string message = "Run! Extension";
	std::cout << "Testing " << message << " - Success!" << std::endl;

	return 0;
}
