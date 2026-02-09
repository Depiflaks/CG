//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H
#include "letter.h"

#include <SFML/Graphics.hpp>
#include <SFML/Window/VideoMode.hpp>

#include "lib/core/core.h"
#include <algorithm> // std::min
#include <iostream>
#include <memory>
#include <random>

inline float RandomJumpSpeed()
{
	static std::mt19937 rng{ std::random_device{}() };
	static std::uniform_real_distribution dist(-1100.f, -900.f);
	return dist(rng);
}

class InitialsView : public core::AbstractView
{
public:
	InitialsView()
		: AbstractView(800, 800, "initials")
	{
		const sf::Vector2f bounds{ 100.f, 200.f };
		const sf::Vector2f accel{ 0.f, 1200.f };

		m_letters.push_back(
			std::make_unique<LetterS>(sf::Vector2f{ 250.f, m_groundY },
				sf::Vector2f{ 0.f, RandomJumpSpeed() }, accel, bounds, sf::Color::Yellow));

		m_letters.push_back(
			std::make_unique<LetterS>(sf::Vector2f{ 400.f, m_groundY },
				sf::Vector2f{ 0.f, RandomJumpSpeed() }, accel, bounds, sf::Color::Cyan));

		m_letters.push_back(std::make_unique<LetterU>(
			sf::Vector2f{ 550.f, m_groundY }, sf::Vector2f{ 0.f, RandomJumpSpeed() },
			accel, bounds, sf::Color::Magenta));
	}

private:
	void UpdateObjects(float dt) override
	{
		for (const auto& m_letter : m_letters)
		{
			m_letter->IntegratePosition(dt);
			m_letter->IntegrateSpeed(dt);
			if (m_letter->Position().y > m_groundY + 10.0f)
			{
				m_letter->SetSpeed({ 0, RandomJumpSpeed() });
			}
		}
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
