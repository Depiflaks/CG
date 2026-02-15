//
// Created by smmm on 2/15/26.
//

#ifndef CG_BUTTON_H
#define CG_BUTTON_H
#include <algorithm>
#include <functional>

class Button
{
public:
	explicit Button(const std::function<void()>& onClick)
		: m_onClick(std::move(onClick))
	{
	}

private:
	std::function<void()> m_onClick;
};

#endif // CG_BUTTON_H
