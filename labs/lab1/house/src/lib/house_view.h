//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H
#include "letter.h"

#include <SFML/Graphics.hpp>

#include "lib/core/core.h"
#include <memory>
#include <random>

class InitialsView : public core::AbstractView
{
public:
	InitialsView()
		: AbstractView(800, 800, "house")
	{
	}

private:
	void UpdateObjects(float dt) override
	{

	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		for (const auto& m_letter : m_letters)
		{
			m_letter->Draw(target, states);
		}
	}

	std::vector<std::unique_ptr<Letter>> m_letters{};

	const float m_groundY = 600.f;
};

#endif // CG_VIEW_H
